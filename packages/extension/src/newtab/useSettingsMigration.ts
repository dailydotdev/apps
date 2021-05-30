import { useEffect, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';
import usePersistentState from '@dailydotdev/shared/src/hooks/usePersistentState';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import request, { gql } from 'graphql-request';
import { useMutation } from 'react-query';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';

const SETTINGS_V2_KEY = 'state';
const POSTPONE_ANONYMOUS = 1;
const POSTPONE_LOGGED_IN = 2;
const POSTPONE_DONT = 3;

type SettingsV2 = {
  state?: {
    feed?: {
      bookmarks?: { id: string }[];
      enabledTags?: Record<string, boolean>;
      disabledPublications?: Record<string, boolean>;
    };
  };
};

export type UseSettingsMigrationRet = {
  hasSettings: boolean;
  showMigrationModal: boolean;
  migrateAfterSignIn: () => Promise<void>;
  postponeMigration: () => Promise<void>;
  isMigrating: boolean;
  migrate: () => Promise<void>;
  migrationCompleted: boolean;
  ackMigrationCompleted: () => void;
  forceMigrationModal: () => Promise<void>;
  postponed: boolean;
};

const generateQuery = (settings: SettingsV2): string => {
  const hasBookmarks = settings?.state?.feed?.bookmarks?.length > 0;
  const hasTags =
    Object.keys(settings?.state?.feed?.enabledTags ?? {}).length > 0;
  const hasSources =
    Object.keys(settings?.state?.feed?.disabledPublications ?? {}).length > 0;
  return gql`
    mutation MergeSettings(
      ${hasBookmarks ? `$bookmarks: AddBookmarkInput!` : ''}
      ${hasTags || hasSources ? `$filters: FiltersInput!` : ''}
    ) {
      ${
        hasBookmarks
          ? `addBookmarks(data: $bookmarks) {
      _
    }`
          : ''
      }
      ${
        hasTags || hasSources
          ? `feedSettings: addFiltersToFeed(filters: $filters) {
      id
    }`
          : ''
      }
    }
  `;
};

const checkIfHasSettings = (settings: SettingsV2): boolean =>
  settings?.state?.feed?.bookmarks?.length > 0 ||
  Object.keys(settings?.state?.feed?.enabledTags ?? {}).length > 0 ||
  Object.keys(settings?.state?.feed?.disabledPublications ?? {}).length > 0;

const objectToEnabledKeys = (obj?: Record<string, boolean>): string[] => {
  if (!obj) {
    return [];
  }
  return Object.keys(obj).filter((key) => obj[key]);
};

export default function useSettingsMigration(
  user: LoggedUser,
  tokenRefreshed: boolean,
): UseSettingsMigrationRet {
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const [settings, setSettings] = useState<SettingsV2>();
  const [postpone, setPostpone] = usePersistentState(
    'postponeSettingsMigration',
    null,
    POSTPONE_DONT,
  );
  const [migrateAfterSignIn, setMigrateAfterSignIn] = usePersistentState(
    'migrateAfterSignIn',
    false,
    false,
  );

  const { mutateAsync: migrate, isLoading: isMigrating } = useMutation(
    () =>
      request(`${apiUrl}/graphql`, generateQuery(settings), {
        bookmarks: {
          postIds:
            settings?.state?.feed?.bookmarks?.map?.((post) => post.id) ?? [],
        },
        filters: {
          includeTags: objectToEnabledKeys(settings?.state?.feed?.enabledTags),
          excludeSources: objectToEnabledKeys(
            settings?.state?.feed?.disabledPublications,
          ),
        },
      }),
    {
      onSuccess: async () => {
        await setSettings(null);
        await browser.storage.local.set({ [SETTINGS_V2_KEY]: {} });
        setMigrationCompleted(true);
      },
    },
  );

  useEffect(() => {
    browser.storage.local.get(SETTINGS_V2_KEY).then(setSettings);
  }, []);

  const hasSettings = checkIfHasSettings(settings);

  useEffect(() => {
    if (user && tokenRefreshed && migrateAfterSignIn && hasSettings) {
      migrate();
    }
  }, [user, tokenRefreshed, migrateAfterSignIn, hasSettings]);

  return {
    hasSettings,
    showMigrationModal:
      hasSettings &&
      !migrateAfterSignIn &&
      postpone !== null &&
      ((!user && postpone !== POSTPONE_ANONYMOUS) ||
        (user && postpone !== POSTPONE_LOGGED_IN)),
    migrateAfterSignIn: () => setMigrateAfterSignIn(true),
    postponeMigration: () => {
      if (user) {
        return setPostpone(POSTPONE_LOGGED_IN);
      }
      return setPostpone(POSTPONE_ANONYMOUS);
    },
    ackMigrationCompleted: () => setMigrationCompleted(false),
    forceMigrationModal: () => setPostpone(POSTPONE_DONT),
    isMigrating,
    migrationCompleted,
    migrate,
    postponed: hasSettings && postpone !== null && postpone !== POSTPONE_DONT,
  };
}
