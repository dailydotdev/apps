import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import type {
  RemoteSettings,
  RemoteTheme,
  SettingsFlags,
  Spaciness,
} from '../graphql/settings';
import {
  CampaignCtaPlacement,
  UPDATE_USER_SETTINGS_MUTATION,
} from '../graphql/settings';
import { WriteFormTab } from '../components/fields/form/common';
import AuthContext from './AuthContext';
import { capitalize } from '../lib/strings';
import { storageWrapper } from '../lib/storageWrapper';
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
  toggleOptOutCompanion: () => Promise<void>;
  toggleAutoDismissNotifications: () => Promise<void>;
  toggleShowFeedbackButton: () => Promise<void>;
  loadedSettings: boolean;
  updateCustomLinks: (links: string[]) => Promise<unknown>;
  updateSortCommentsBy: (sort: SortCommentsBy) => Promise<unknown>;
  updateFlag: (
    flag: keyof SettingsFlags,
    value: string | boolean,
  ) => Promise<unknown>;
  updateFlagRemote: (
    flag: keyof SettingsFlags,
    value: string | boolean,
  ) => Promise<unknown>;
  updatePromptFlag: (flag: string, value: boolean) => Promise<unknown>;
  syncSettings: (bootUserId?: string) => Promise<unknown>;
  onToggleHeaderPlacement(): Promise<unknown>;
  setSettings: (newSettings: Partial<RemoteSettings>) => Promise<void>;
  applyThemeMode: (mode?: ThemeMode) => void;
}

const asyncNoopVoid = async (): Promise<void> => undefined;
const asyncNoopUnknown = async (): Promise<unknown> => undefined;
const noop = (): void => undefined;

const SettingsContext = React.createContext<SettingsContextData>({
  spaciness: 'eco',
  openNewTab: true,
  insaneMode: false,
  showTopSites: true,
  sidebarExpanded: false,
  companionExpanded: false,
  sortingEnabled: false,
  optOutReadingStreak: false,
  optOutCompanion: false,
  autoDismissNotifications: true,
  sortCommentsBy: SortCommentsBy.OldestFirst,
  showFeedbackButton: true,
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
  themeMode: ThemeMode.Dark,
  setTheme: asyncNoopVoid,
  toggleOpenNewTab: asyncNoopVoid,
  setSpaciness: asyncNoopVoid,
  toggleInsaneMode: asyncNoopVoid,
  toggleShowTopSites: asyncNoopVoid,
  toggleSidebarExpanded: asyncNoopVoid,
  toggleSortingEnabled: asyncNoopVoid,
  toggleOptOutReadingStreak: asyncNoopVoid,
  toggleOptOutCompanion: asyncNoopVoid,
  toggleAutoDismissNotifications: asyncNoopVoid,
  toggleShowFeedbackButton: asyncNoopVoid,
  loadedSettings: false,
  updateCustomLinks: asyncNoopUnknown,
  updateSortCommentsBy: asyncNoopUnknown,
  updateFlag: asyncNoopUnknown,
  updateFlagRemote: asyncNoopUnknown,
  updatePromptFlag: asyncNoopUnknown,
  syncSettings: asyncNoopUnknown,
  onToggleHeaderPlacement: asyncNoopUnknown,
  setSettings: asyncNoopVoid,
  applyThemeMode: noop,
});
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
  optOutCompanion: false,
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

const defaultSettingsFlags: SettingsFlags = {
  sidebarSquadExpanded: true,
  sidebarCustomFeedsExpanded: true,
  sidebarOtherExpanded: true,
  sidebarResourcesExpanded: true,
  sidebarBookmarksExpanded: true,
  clickbaitShieldEnabled: true,
  defaultWriteTab: WriteFormTab.NewPost,
};

export const SettingsContextProvider = ({
  children,
  settings = defaultSettings,
  updateSettings,
  loadedSettings,
}: SettingsContextProviderProps): ReactElement => {
  const setTheme = useRef<ThemeMode | undefined>();
  const { user } = useContext(AuthContext);
  const userId = user?.id;
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
    Partial<RemoteSettings>
  >({
    mutationFn: (params) =>
      gqlClient.request(UPDATE_USER_SETTINGS_MUTATION, {
        data: params,
      }),

    onError: (_, params) => {
      const rollback = (
        Object.keys(params) as Array<keyof RemoteSettings>
      ).reduce(
        (values, key) => ({ ...values, [key]: settings[key] }),
        {} as Partial<RemoteSettings>,
      );

      updateSettings?.({ ...settings, ...rollback });
    },
  });

  const applyThemeMode = useCallback(
    (mode?: ThemeMode) => {
      if (mode) {
        setTheme.current = mode;
      } else {
        setTheme.current = undefined;
      }

      applyTheme(setTheme.current || themeModes[settings.theme]);
    },
    [settings.theme],
  );

  useEffect(() => {
    const lightMode = storageWrapper.getItem?.(deprecatedLightModeStorageKey);
    if (lightMode === 'true') {
      applyTheme(ThemeMode.Light);
    }
  }, []);

  const updateRemoteSettingsFn = async (
    newSettings: Partial<RemoteSettings>,
    bootUserId?: string,
  ): Promise<void> => {
    if (userId || bootUserId) {
      await updateRemoteSettings({
        ...newSettings,
      });
    }
  };

  const setSettings = async (
    newSettings: Partial<RemoteSettings>,
  ): Promise<void> => {
    updateSettings?.({ ...settings, ...newSettings });
    await updateRemoteSettingsFn(newSettings);
  };

  const syncSettings = async (bootUserId?: string) => {
    await updateRemoteSettingsFn(settings, bootUserId);
  };

  const settingsFlags: SettingsFlags = settings.flags ?? defaultSettingsFlags;

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
      updateCustomLinks: (links: string[]) =>
        setSettings({ ...settings, customLinks: links }),
      updateSortCommentsBy: (sortCommentsBy: SortCommentsBy) =>
        setSettings({ ...settings, sortCommentsBy }),
      updateFlag: (flag: keyof SettingsFlags, value: string | boolean) =>
        setSettings({
          ...settings,
          flags: {
            ...settingsFlags,
            [flag]: value,
          },
        }),
      updateFlagRemote: (flag: keyof SettingsFlags, value: string | boolean) =>
        updateRemoteSettingsFn({
          ...settings,
          flags: {
            ...settingsFlags,
            [flag]: value,
          },
        }),
      updatePromptFlag: (flag: string, value: boolean) =>
        setSettings({
          ...settings,
          flags: {
            ...settingsFlags,
            prompt: {
              ...(settingsFlags.prompt ?? {}),
              [flag]: value,
            },
          },
        }),
      setSettings,
      applyThemeMode,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, settingsFlags, loadedSettings, userId, applyThemeMode],
  );

  return (
    <SettingsContext.Provider value={contextData}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = (): SettingsContextData =>
  useContext(SettingsContext);
