import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import type {
  ClientOnlyFlagKey,
  ClientOnlySettingsFlags,
  RemoteSettings,
  RemoteTheme,
  SettingsFlags,
  Spaciness,
} from '../graphql/settings';
import {
  CampaignCtaPlacement,
  clientOnlySettingsFlags,
  UPDATE_USER_SETTINGS_MUTATION,
} from '../graphql/settings';
import { WriteFormTab } from '../components/fields/form/common';
import AuthContext from './AuthContext';
import { capitalize } from '../lib/strings';
import { storageWrapper } from '../lib/storageWrapper';
import { generateStorageKey, StorageTopic } from '../lib/storage';
import { usePersonalizedDigest } from '../hooks/usePersonalizedDigest';
import { UserPersonalizedDigestType } from '../graphql/users';
import { gqlClient } from '../graphql/common';
import { SortCommentsBy } from '../graphql/comments';

export enum ThemeMode {
  Dark = 'dark',
  Light = 'light',
  Auto = 'auto',
}

interface ThemeOption {
  label: string;
  value: ThemeMode;
}

export const themes: ThemeOption[] = Object.values(ThemeMode).map((theme) => ({
  label: capitalize(theme),
  value: theme,
}));

export interface SettingsContextData extends Omit<RemoteSettings, 'theme'> {
  themeMode: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleOpenNewTab: () => Promise<void>;
  setSpaciness: (density: Spaciness) => Promise<void>;
  toggleInsaneMode: (insaneMode: boolean) => Promise<void>;
  toggleShowTopSites: () => Promise<void>;
  toggleSidebarExpanded: () => Promise<void>;
  toggleSortingEnabled: () => Promise<void>;
  toggleOptOutReadingStreak: () => Promise<void>;
  toggleOptOutStreakFreeze: () => Promise<void>;
  toggleOptOutLevelSystem: () => Promise<void>;
  toggleOptOutQuestSystem: () => Promise<void>;
  toggleOptOutAchievements: () => Promise<void>;
  toggleOptOutCompanion: () => Promise<void>;
  isGamificationEnabled: boolean;
  toggleAllGamification: () => Promise<void>;
  // The quest experience as one switch: levels + quests + achievements together
  // (reading streaks stay separate). Needed because the individual toggles each
  // setState off the same captured snapshot, so they can't be chained.
  isQuestExperienceEnabled: boolean;
  toggleQuestExperience: () => Promise<void>;
  toggleAutoDismissNotifications: () => Promise<void>;
  toggleShowFeedbackButton: () => Promise<void>;
  // Settings are usable (a cached copy is in hand). NOT a promise that they
  // match the server — see `isRemoteSettingsLoaded` for that.
  loadedSettings: boolean;
  // The boot response has landed AND been applied, so `flags` reflects what the
  // account actually holds. Anything that treats a missing value as "the server
  // has none" has to wait for this one.
  isRemoteSettingsLoaded: boolean;
  updateCustomLinks: (links: string[]) => Promise<unknown>;
  updateSortCommentsBy: (sort: SortCommentsBy) => Promise<unknown>;
  updateFlag: <K extends keyof SettingsFlags>(
    flag: K,
    value: SettingsFlags[K],
  ) => Promise<unknown>;
  updateFlagRemote: <K extends keyof SettingsFlags>(
    flag: K,
    value: SettingsFlags[K],
  ) => Promise<unknown>;
  updatePromptFlag: (flag: string, value: boolean) => Promise<unknown>;
  syncSettings: (bootUserId?: string) => Promise<unknown>;
  onToggleHeaderPlacement(): Promise<unknown>;
  setSettings: (newSettings: Partial<RemoteSettings>) => Promise<void>;
  applyThemeMode: (mode?: ThemeMode) => void;
}

const SettingsContext = React.createContext<SettingsContextData>(null);
export default SettingsContext;

const deprecatedLightModeStorageKey = 'showmethelight';

export const themeModes: Record<RemoteTheme, ThemeMode> = {
  bright: ThemeMode.Light,
  darcula: ThemeMode.Dark,
  auto: ThemeMode.Auto,
};

export const remoteThemes: Record<ThemeMode, RemoteTheme> = {
  [ThemeMode.Light]: 'bright',
  [ThemeMode.Dark]: 'darcula',
  [ThemeMode.Auto]: 'auto',
};

export function applyTheme(
  themeMode: ThemeMode,
  el: HTMLElement = document.documentElement,
): void {
  if (!el || el.classList.contains(themeMode)) {
    return;
  }

  if (themeMode === ThemeMode.Dark) {
    el.classList.remove(ThemeMode.Light);
    el.classList.remove(ThemeMode.Auto);
  } else if (themeMode === ThemeMode.Light) {
    el.classList.add(ThemeMode.Light);
    el.classList.remove(ThemeMode.Auto);
  } else {
    el.classList.remove(ThemeMode.Light);
    el.classList.add(ThemeMode.Auto);
  }
}

export type SettingsContextProviderProps = {
  children?: ReactNode;
  settings?: RemoteSettings;
  updateSettings?: (settings: RemoteSettings) => unknown;
  loadedSettings?: boolean;
  isRemoteSettingsLoaded?: boolean;
};

const defaultSettings: RemoteSettings = {
  spaciness: 'eco',
  openNewTab: true,
  insaneMode: false,
  showTopSites: true,
  sidebarExpanded: false,
  companionExpanded: false,
  sortingEnabled: false,
  optOutReadingStreak: false,
  optOutStreakFreeze: false,
  optOutLevelSystem: false,
  optOutQuestSystem: false,
  optOutAchievements: false,
  // Companion is opt-in: it injects a side panel into every article page,
  // which only some users want. Default to off so new users see a clean
  // feed and can flip the toggle in the customize sidebar's Widgets
  // section if they want it.
  optOutCompanion: true,
  autoDismissNotifications: true,
  sortCommentsBy: SortCommentsBy.OldestFirst,
  showFeedbackButton: true,
  theme: remoteThemes[ThemeMode.Dark],
  campaignCtaPlacement: CampaignCtaPlacement.Header,
  flags: {
    sidebarSquadExpanded: true,
    sidebarCustomFeedsExpanded: true,
    sidebarOtherExpanded: true,
    sidebarResourcesExpanded: true,
    sidebarBookmarksExpanded: true,
    clickbaitShieldEnabled: true,
    defaultWriteTab: WriteFormTab.NewPost,
  },
};

// These are account preferences that happen to be parked on the device, so the
// store is keyed by account: without it a second login on the same machine
// inherits the first one's rail density and pinned dock.
const clientOnlyFlagsKey = (userId?: string): string =>
  generateStorageKey(
    StorageTopic.Settings,
    'clientOnlyFlags',
    userId ?? 'anonymous',
  );

const legacyClientOnlyFlagsKey = generateStorageKey(
  StorageTopic.Settings,
  'clientOnlyFlags',
);

const parseStoredFlags = (
  raw: string | null,
): Partial<SettingsFlags> | null => {
  try {
    const parsed = JSON.parse(raw);
    // A non-object (truncated write, key reused by another build) would blow
    // up the `in` checks below.
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch (err) {
    return null;
  }
};

const readStoredFlags = (userId?: string): Partial<SettingsFlags> => {
  const stored = parseStoredFlags(
    storageWrapper.getItem(clientOnlyFlagsKey(userId)),
  );

  if (stored || !userId) {
    return stored ?? {};
  }

  // First load since the store became per-account: this user reads the
  // device-wide entry until `adoptLegacyStoredFlags` moves it across.
  return (
    parseStoredFlags(storageWrapper.getItem(legacyClientOnlyFlagsKey)) ?? {}
  );
};

const isClientOnlyFlag = (flag: string): boolean =>
  clientOnlySettingsFlags.includes(flag as ClientOnlyFlagKey);

const pickClientOnlyFlags = (
  flags: Partial<SettingsFlags>,
): ClientOnlySettingsFlags =>
  clientOnlySettingsFlags.reduce((picked, flag) => {
    if (flag in flags) {
      return { ...picked, [flag]: flags[flag] };
    }

    return picked;
  }, {});

// Merge, never replace. The store has several owners (the rail density, the
// dock, the panel toggles) and a caller only ever carries its own keys, so a
// replace drops whichever ones its `flags` had not loaded yet — and loses a
// second tab's write landing between this read and the set.
const writeStoredFlags = (
  userId: string | undefined,
  flags: ClientOnlySettingsFlags,
): void =>
  storageWrapper.setItem(
    clientOnlyFlagsKey(userId),
    JSON.stringify({ ...readStoredFlags(userId), ...flags }),
  );

// The one write that has to remove keys: a graduated flag leaves the store for
// good once the API holds it, which is what stops the migration repeating.
const dropGraduatedStoredFlags = (userId?: string): void =>
  storageWrapper.setItem(
    clientOnlyFlagsKey(userId),
    JSON.stringify(pickClientOnlyFlags(readStoredFlags(userId))),
  );

// Hand the pre-per-account entry to the first account that loads after the
// change, then delete it so the next account on this device starts clean.
// Nobody signed out keeps their flags through this: their copy was written to
// the device-wide key and this only rescues it for a signed-in reader.
const adoptLegacyStoredFlags = (userId: string): void => {
  const legacy = storageWrapper.getItem(legacyClientOnlyFlagsKey);

  if (!legacy) {
    return;
  }

  if (!storageWrapper.getItem(clientOnlyFlagsKey(userId))) {
    storageWrapper.setItem(clientOnlyFlagsKey(userId), legacy);
  }

  storageWrapper.removeItem(legacyClientOnlyFlagsKey);
};

// Graduated = dropped from `clientOnlySettingsFlags` because the API stores it
// now, but still sitting in this user's local storage.
const pickGraduatedFlags = (
  flags: Partial<SettingsFlags>,
): Partial<SettingsFlags> =>
  Object.fromEntries(
    Object.entries(flags).filter(([flag]) => !isClientOnlyFlag(flag)),
  );

const withoutClientOnlyFlags = (settings: RemoteSettings): RemoteSettings => {
  if (!settings.flags) {
    return settings;
  }

  const flags = { ...settings.flags };
  clientOnlySettingsFlags.forEach((flag) => delete flags[flag]);

  return { ...settings, flags };
};

// Client-only flags are stripped from the payload, so a write that touched
// nothing else would send a request identical to the last one — a reorder drag
// in the shortcuts dock fires a burst of them. The seam stays honest: the day
// the field graduates it stops counting as client-only and the write goes out.
const isClientOnlySettingsChange = (
  current: RemoteSettings,
  next: RemoteSettings,
): boolean => {
  const changed = Object.keys(next).filter(
    (key: keyof RemoteSettings) =>
      key !== 'flags' && next[key] !== current[key],
  );

  if (changed.length) {
    return false;
  }

  const currentFlags: Partial<SettingsFlags> = current.flags ?? {};
  const nextFlags: Partial<SettingsFlags> = next.flags ?? {};
  const changedFlags = Array.from(
    new Set([...Object.keys(currentFlags), ...Object.keys(nextFlags)]),
  ).filter(
    (flag: keyof SettingsFlags) => nextFlags[flag] !== currentFlags[flag],
  );

  return changedFlags.length > 0 && changedFlags.every(isClientOnlyFlag);
};

export const SettingsContextProvider = ({
  children,
  settings: remoteSettings = defaultSettings,
  updateSettings,
  loadedSettings,
  isRemoteSettingsLoaded,
}: SettingsContextProviderProps): ReactElement => {
  const setTheme = useRef<ThemeMode | null>(null);
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  // Local storage, not the boot cache: a page load overwrites the cache with
  // what the API returns, which never includes the flags it doesn't store.
  //
  // Read during render rather than in an effect. The account id arrives with
  // the boot cache, so an effect-based read would land a render AFTER the
  // settings it belongs to: the rail would paint full-width labels for a frame
  // before snapping narrow, and the migration below would see a `settings` that
  // does not carry these flags yet.
  const [storedFlagsRevision, setStoredFlagsRevision] = useState(0);
  const clientFlags = useMemo(
    () => pickClientOnlyFlags(readStoredFlags(userId)),
    // Local storage is not reactive; the revision re-reads it after our writes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, storedFlagsRevision],
  );

  useEffect(() => {
    if (!userId) {
      return;
    }

    adoptLegacyStoredFlags(userId);
  }, [userId]);

  const settings = useMemo(() => {
    if (!Object.keys(clientFlags).length) {
      return remoteSettings;
    }

    return {
      ...remoteSettings,
      flags: { ...remoteSettings.flags, ...clientFlags },
    };
  }, [remoteSettings, clientFlags]);
  const { unsubscribePersonalizedDigest } = usePersonalizedDigest();

  useEffect(() => {
    if (!loadedSettings || setTheme.current) {
      return;
    }

    applyTheme(themeModes[settings.theme]);
  }, [settings.theme, loadedSettings]);

  const { mutateAsync: updateRemoteSettings } = useMutation<
    unknown,
    unknown,
    RemoteSettings
  >({
    mutationFn: (params) =>
      gqlClient.request(UPDATE_USER_SETTINGS_MUTATION, {
        data: params,
      }),

    onError: (_, params) => {
      const rollback = Object.keys(params).reduce(
        (values, key) => ({ ...values, [key]: settings[key] }),
        {},
      );

      updateSettings({ ...settings, ...rollback });
    },
  });

  const applyThemeMode = useCallback(
    (mode?: ThemeMode) => {
      if (mode) {
        setTheme.current = mode;
      } else {
        setTheme.current = null;
      }

      applyTheme(setTheme.current || themeModes[settings.theme]);
    },
    [settings.theme],
  );

  useEffect(() => {
    const lightMode = storageWrapper.getItem(deprecatedLightModeStorageKey);
    if (lightMode === 'true') {
      applyTheme(ThemeMode.Light);
    }
  }, []);

  const updateRemoteSettingsFn = async (
    newSettings: RemoteSettings,
    bootUserId?: string,
  ): Promise<void> => {
    if (userId || bootUserId) {
      await updateRemoteSettings(withoutClientOnlyFlags(newSettings));
    }
  };

  const setSettings = async (newSettings: RemoteSettings): Promise<void> => {
    if (newSettings.flags) {
      writeStoredFlags(userId, pickClientOnlyFlags(newSettings.flags));
      setStoredFlagsRevision((revision) => revision + 1);
    }

    updateSettings({ ...settings, ...newSettings });

    if (isClientOnlySettingsChange(settings, newSettings)) {
      return;
    }

    await updateRemoteSettingsFn(newSettings);
  };

  const syncSettings = async (bootUserId?: string) => {
    await updateRemoteSettingsFn(settings, bootUserId);
  };

  // A graduated flag still lives in local storage for every existing user, so
  // push it up once — server value wins if there already is one. Dropping the
  // migrated keys is what stops this repeating.
  //
  // Gated on the remote settings rather than `loadedSettings` (cache presence):
  // "the server has no value" has to be read off the response, not off last
  // session's cache, or a value set on another device reads as absent and this
  // device's leftover overwrites it.
  const hasMigratedFlagsRef = useRef(false);
  useEffect(() => {
    if (hasMigratedFlagsRef.current || !isRemoteSettingsLoaded || !userId) {
      return;
    }

    const graduated = pickGraduatedFlags(readStoredFlags(userId));
    if (!Object.keys(graduated).length) {
      return;
    }

    hasMigratedFlagsRef.current = true;
    const pending = Object.fromEntries(
      Object.entries(graduated).filter(
        ([flag]) => remoteSettings.flags?.[flag] === undefined,
      ),
    );

    if (Object.keys(pending).length) {
      setSettings({
        ...settings,
        flags: { ...settings.flags, ...pending },
      }).catch(() => undefined);
    }

    dropGraduatedStoredFlags(userId);
    setStoredFlagsRevision((revision) => revision + 1);
    // `settings`/`setSettings` are re-created every render; the ref bounds this
    // to one run, so their identity is noise here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRemoteSettingsLoaded, userId]);

  const contextData = useMemo<SettingsContextData>(
    () => ({
      ...settings,
      syncSettings,
      themeMode: themeModes[settings.theme],
      setTheme: (theme: ThemeMode) =>
        setSettings({ ...settings, theme: remoteThemes[theme] }),
      toggleOpenNewTab: () =>
        setSettings({ ...settings, openNewTab: !settings.openNewTab }),
      setSpaciness: (density) =>
        setSettings({ ...settings, spaciness: density }),
      toggleInsaneMode: (insaneMode) =>
        setSettings({ ...settings, insaneMode }),
      toggleShowTopSites: () =>
        setSettings({ ...settings, showTopSites: !settings.showTopSites }),
      toggleSidebarExpanded: () =>
        setSettings({
          ...settings,
          sidebarExpanded: !settings.sidebarExpanded,
        }),
      toggleSortingEnabled: () =>
        setSettings({ ...settings, sortingEnabled: !settings.sortingEnabled }),
      toggleOptOutReadingStreak: () => {
        unsubscribePersonalizedDigest({
          type: UserPersonalizedDigestType.StreakReminder,
        });
        return setSettings({
          ...settings,
          optOutReadingStreak: !settings.optOutReadingStreak,
        });
      },
      toggleOptOutStreakFreeze: () =>
        setSettings({
          ...settings,
          optOutStreakFreeze: !settings.optOutStreakFreeze,
        }),
      toggleOptOutLevelSystem: () =>
        setSettings({
          ...settings,
          optOutLevelSystem: !settings.optOutLevelSystem,
        }),
      toggleOptOutQuestSystem: () =>
        setSettings({
          ...settings,
          optOutQuestSystem: !settings.optOutQuestSystem,
        }),
      toggleOptOutAchievements: () =>
        setSettings({
          ...settings,
          optOutAchievements: !settings.optOutAchievements,
        }),
      isGamificationEnabled:
        !settings.optOutReadingStreak ||
        !settings.optOutLevelSystem ||
        !settings.optOutQuestSystem ||
        !settings.optOutAchievements,
      toggleAllGamification: () => {
        const anyEnabled =
          !settings.optOutReadingStreak ||
          !settings.optOutLevelSystem ||
          !settings.optOutQuestSystem ||
          !settings.optOutAchievements;
        if (anyEnabled && !settings.optOutReadingStreak) {
          unsubscribePersonalizedDigest({
            type: UserPersonalizedDigestType.StreakReminder,
          });
        }
        return setSettings({
          ...settings,
          optOutReadingStreak: anyEnabled,
          optOutLevelSystem: anyEnabled,
          optOutQuestSystem: anyEnabled,
          optOutAchievements: anyEnabled,
        });
      },
      isQuestExperienceEnabled:
        !settings.optOutLevelSystem ||
        !settings.optOutQuestSystem ||
        !settings.optOutAchievements,
      toggleQuestExperience: () => {
        const anyEnabled =
          !settings.optOutLevelSystem ||
          !settings.optOutQuestSystem ||
          !settings.optOutAchievements;
        return setSettings({
          ...settings,
          optOutLevelSystem: anyEnabled,
          optOutQuestSystem: anyEnabled,
          optOutAchievements: anyEnabled,
        });
      },
      toggleOptOutCompanion: () =>
        setSettings({
          ...settings,
          optOutCompanion: !settings.optOutCompanion,
        }),
      toggleAutoDismissNotifications: () =>
        setSettings({
          ...settings,
          autoDismissNotifications: !settings.autoDismissNotifications,
        }),
      toggleShowFeedbackButton: () =>
        setSettings({
          ...settings,
          showFeedbackButton: !settings.showFeedbackButton,
        }),
      onToggleHeaderPlacement: () =>
        setSettings({
          ...settings,
          campaignCtaPlacement:
            settings.campaignCtaPlacement === CampaignCtaPlacement.Header
              ? CampaignCtaPlacement.ProfileMenu
              : CampaignCtaPlacement.Header,
        }),
      loadedSettings: loadedSettings ?? false,
      isRemoteSettingsLoaded: isRemoteSettingsLoaded ?? false,
      updateCustomLinks: (links: string[]) =>
        setSettings({ ...settings, customLinks: links }),
      updateSortCommentsBy: (sortCommentsBy: SortCommentsBy) =>
        setSettings({ ...settings, sortCommentsBy }),
      updateFlag: <K extends keyof SettingsFlags>(
        flag: K,
        value: SettingsFlags[K],
      ) =>
        setSettings({
          ...settings,
          flags: {
            ...settings.flags,
            [flag]: value,
          },
        }),
      updateFlagRemote: <K extends keyof SettingsFlags>(
        flag: K,
        value: SettingsFlags[K],
      ) =>
        updateRemoteSettingsFn({
          ...settings,
          flags: {
            ...settings.flags,
            [flag]: value,
          },
        }),
      updatePromptFlag: (flag: keyof SettingsFlags, value: boolean) =>
        setSettings({
          ...settings,
          flags: {
            ...settings.flags,
            prompt: {
              ...settings.flags.prompt,
              [flag]: value,
            },
          },
        }),
      setSettings,
      applyThemeMode,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, loadedSettings, isRemoteSettingsLoaded, userId, applyThemeMode],
  );

  return (
    <SettingsContext.Provider value={contextData}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = (): SettingsContextData =>
  useContext(SettingsContext);
