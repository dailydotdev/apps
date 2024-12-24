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
  type SettingsFlags,
  Spaciness,
} from '../graphql/settings';
import {
  CampaignCtaPlacement,
  UPDATE_USER_SETTINGS_MUTATION,
} from '../graphql/settings';
import AuthContext from './AuthContext';
import { capitalize } from '../lib/strings';
import { storageWrapper } from '../lib/storageWrapper';
import { usePersonalizedDigest } from '../hooks/usePersonalizedDigest';
import { UserPersonalizedDigestType } from '../graphql/users';
import { ChecklistViewState } from '../lib/checklist';
import { gqlClient } from '../graphql/common';

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
  toggleInsaneMode: () => Promise<void>;
  toggleShowTopSites: () => Promise<void>;
  toggleSidebarExpanded: () => Promise<void>;
  toggleSortingEnabled: () => Promise<void>;
  toggleOptOutReadingStreak: () => Promise<void>;
  toggleOptOutCompanion: () => Promise<void>;
  toggleAutoDismissNotifications: () => Promise<void>;
  loadedSettings: boolean;
  updateCustomLinks: (links: string[]) => Promise<unknown>;
  updateFlag: (flag: keyof SettingsFlags, value: boolean) => Promise<unknown>;
  syncSettings: (bootUserId?: string) => Promise<unknown>;
  onToggleHeaderPlacement(): Promise<unknown>;
  setOnboardingChecklistView: (value: ChecklistViewState) => Promise<unknown>;
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
  theme: remoteThemes[ThemeMode.Dark],
  campaignCtaPlacement: CampaignCtaPlacement.Header,
  onboardingChecklistView: ChecklistViewState.Hidden,
  flags: {
    sidebarSquadExpanded: true,
    sidebarCustomFeedsExpanded: true,
    sidebarOtherExpanded: true,
    sidebarResourcesExpanded: true,
    sidebarBookmarksExpanded: true,
    clickbaitShieldEnabled: true,
  },
};

export const SettingsContextProvider = ({
  children,
  settings = defaultSettings,
  updateSettings,
  loadedSettings,
}: SettingsContextProviderProps): ReactElement => {
  const setTheme = useRef<ThemeMode>(null);
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
      await updateRemoteSettings({
        ...newSettings,
      });
    }
  };

  const setSettings = async (newSettings: RemoteSettings): Promise<void> => {
    updateSettings({ ...settings, ...newSettings });
    await updateRemoteSettingsFn(newSettings);
  };

  const syncSettings = async (bootUserId?: string) => {
    await updateRemoteSettingsFn(settings, bootUserId);
  };

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
      toggleInsaneMode: () =>
        setSettings({ ...settings, insaneMode: !settings.insaneMode }),
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
      onToggleHeaderPlacement: () =>
        setSettings({
          ...settings,
          campaignCtaPlacement:
            settings.campaignCtaPlacement === CampaignCtaPlacement.Header
              ? CampaignCtaPlacement.ProfileMenu
              : CampaignCtaPlacement.Header,
        }),
      loadedSettings,
      updateCustomLinks: (links: string[]) =>
        setSettings({ ...settings, customLinks: links }),
      setOnboardingChecklistView: (value: ChecklistViewState) =>
        setSettings({
          ...settings,
          onboardingChecklistView: value,
        }),
      updateFlag: (flag: keyof SettingsFlags, value: boolean) =>
        setSettings({
          ...settings,
          flags: {
            ...settings.flags,
            [flag]: value,
          },
        }),
      setSettings,
      applyThemeMode,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, loadedSettings, userId, applyThemeMode],
  );

  return (
    <SettingsContext.Provider value={contextData}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = (): SettingsContextData =>
  useContext(SettingsContext);
