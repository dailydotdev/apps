import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import {
  RemoteSettings,
  RemoteTheme,
  Spaciness,
  UPDATE_USER_SETTINGS_MUTATION,
} from '../graphql/settings';
import AuthContext from './AuthContext';
import { apiUrl } from '../lib/config';
import { storageWrapper } from '../lib/storageWrapper';

export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  Auto = 'auto',
}

export type BookmarksSharing = {
  enabled: boolean;
  slug: string;
  rssUrl: string;
};

export type SettingsContextData = {
  spaciness: Spaciness;
  themeMode: ThemeMode;
  showOnlyUnreadPosts: boolean;
  openNewTab: boolean;
  insaneMode: boolean;
  showTopSites: boolean;
  sidebarExpanded: boolean;
  sortingEnabled: boolean;
  optOutWeeklyGoal: boolean;
  optOutCompanion: boolean;
  autoDismissNotifications: boolean;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleShowOnlyUnreadPosts: () => Promise<void>;
  toggleOpenNewTab: () => Promise<void>;
  setSpaciness: (density: Spaciness) => Promise<void>;
  toggleInsaneMode: () => Promise<void>;
  toggleShowTopSites: () => Promise<void>;
  toggleSidebarExpanded: () => Promise<void>;
  toggleSortingEnabled: () => Promise<void>;
  toggleOptOutWeeklyGoal: () => Promise<void>;
  toggleOptOutCompanion: () => Promise<void>;
  toggleAutoDismissNotifications: () => Promise<void>;
  loadedSettings: boolean;
  customLinks?: string[];
  updateCustomLinks: (links: string[]) => Promise<unknown>;
};

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
  showOnlyUnreadPosts: false,
  openNewTab: true,
  insaneMode: false,
  showTopSites: true,
  sidebarExpanded: true,
  companionExpanded: false,
  sortingEnabled: false,
  optOutWeeklyGoal: false,
  optOutCompanion: false,
  autoDismissNotifications: true,
  theme: remoteThemes[ThemeMode.Dark],
};

export const SettingsContextProvider = ({
  children,
  settings = defaultSettings,
  updateSettings,
  loadedSettings,
}: SettingsContextProviderProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const userId = user?.id;

  useEffect(() => {
    if (!loadedSettings) {
      return;
    }

    applyTheme(themeModes[settings.theme]);
  }, [settings.theme, loadedSettings]);

  const { mutateAsync: updateRemoteSettings } = useMutation<
    unknown,
    unknown,
    RemoteSettings
  >(
    (params) =>
      request(`${apiUrl}/graphql`, UPDATE_USER_SETTINGS_MUTATION, {
        data: params,
      }),
    {
      onError: (_, params) => {
        const rollback = Object.keys(params).reduce(
          (values, key) => ({ ...values, [key]: settings[key] }),
          {},
        );

        updateSettings({ ...settings, ...rollback });
      },
    },
  );

  useEffect(() => {
    const lightMode = storageWrapper.getItem(deprecatedLightModeStorageKey);
    if (lightMode === 'true') {
      applyTheme(ThemeMode.Light);
    }
  }, []);

  const updateRemoteSettingsFn = async (
    newSettings: RemoteSettings,
  ): Promise<void> => {
    if (userId) {
      await updateRemoteSettings({
        ...newSettings,
      });
    }
  };

  const setSettings = async (newSettings: RemoteSettings): Promise<void> => {
    updateSettings({ ...settings, ...newSettings });
    await updateRemoteSettingsFn(newSettings);
  };

  const contextData = useMemo<SettingsContextData>(
    () => ({
      ...settings,
      themeMode: themeModes[settings.theme],
      setTheme: (theme: ThemeMode) =>
        setSettings({ ...settings, theme: remoteThemes[theme] }),
      toggleShowOnlyUnreadPosts: () =>
        setSettings({
          ...settings,
          showOnlyUnreadPosts: !settings.showOnlyUnreadPosts,
        }),
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
      toggleOptOutWeeklyGoal: () =>
        setSettings({
          ...settings,
          optOutWeeklyGoal: !settings.optOutWeeklyGoal,
        }),
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
      loadedSettings,
      updateCustomLinks: (links: string[]) =>
        setSettings({ ...settings, customLinks: links }),
    }),
    [settings, loadedSettings, userId],
  );

  return (
    <SettingsContext.Provider value={contextData}>
      {children}
    </SettingsContext.Provider>
  );
};
