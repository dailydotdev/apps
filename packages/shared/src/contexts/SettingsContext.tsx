import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  RemoteSettings,
  Spaciness,
  UPDATE_USER_SETTINGS_MUTATION,
  USER_SETTINGS_QUERY,
  UserSettingsData,
} from '../graphql/settings';
import ProgressiveEnhancementContext from './ProgressiveEnhancementContext';
import AuthContext from './AuthContext';
import usePersistentState from '../hooks/usePersistentState';
import { useMutation, useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';

export type SettingsContextData = {
  spaciness: Spaciness;
  themeMode: string;
  showOnlyUnreadPosts: boolean;
  openNewTab: boolean;
  insaneMode: boolean;
  setTheme: (theme) => Promise<void>;
  toggleShowOnlyUnreadPosts: () => Promise<void>;
  toggleOpenNewTab: () => Promise<void>;
  setSpaciness: (density: Spaciness) => Promise<void>;
  toggleInsaneMode: () => Promise<void>;
  loadedSettings: boolean;
};

const SettingsContext = React.createContext<SettingsContextData>(null);
export default SettingsContext;

type Settings = {
  spaciness: Spaciness;
  showOnlyUnreadPosts: boolean;
  openNewTab: boolean;
  insaneMode: boolean;
};

const deprecatedLightModeStorageKey = 'showmethelight';
const themeModeStorageKey = 'theme';
const defaultSettings: Settings = {
  spaciness: 'eco',
  showOnlyUnreadPosts: false,
  openNewTab: true,
  insaneMode: false,
};

function applyTheme(themeMode: string): void {
  if (themeMode !== 'auto') {
    document.documentElement.classList.remove('auto');
    const lightMode = themeMode === 'light';
    if (lightMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  } else {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('auto');
  }
}

export type SettingsContextProviderProps = {
  children?: ReactNode;
};

export const SettingsContextProvider = ({
  children,
}: SettingsContextProviderProps): ReactElement => {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user, tokenRefreshed } = useContext(AuthContext);
  const canFetchRemote = windowLoaded && tokenRefreshed;
  const userId = user?.id;

  const [settings, setCachedSettings, loadedSettings] = usePersistentState(
    'settings',
    defaultSettings,
  );
  const [currentTheme, setCurrentTheme] = useState('dark');
  const { data: remoteSettings } = useQuery<UserSettingsData>(
    ['userSettings', userId],
    () => request(`${apiUrl}/graphql`, USER_SETTINGS_QUERY),
    {
      enabled: canFetchRemote && !!userId,
    },
  );

  const { mutateAsync: updateRemoteSettings } = useMutation<
    unknown,
    unknown,
    RemoteSettings
  >((settings) =>
    request(`${apiUrl}/graphql`, UPDATE_USER_SETTINGS_MUTATION, {
      data: settings,
    }),
  );

  useEffect(() => {
    if (remoteSettings) {
      const remoteTheme = remoteSettings.userSettings.theme;
      const lightMode = remoteTheme === 'bright';
      const darkMode = remoteTheme === 'darcula';
      const theme = lightMode ? 'light' : darkMode ? 'dark' : 'auto';
      applyTheme(theme);
      setCurrentTheme(theme);
      localStorage.setItem(themeModeStorageKey, theme);
      const cloneSettings = { ...remoteSettings.userSettings };
      delete cloneSettings.theme;
      setCachedSettings(cloneSettings);
    }
  }, [remoteSettings]);

  useEffect(() => {
    const themeModeCookieValue = localStorage.getItem(themeModeStorageKey);
    if (themeModeCookieValue) {
      setCurrentTheme(themeModeCookieValue);
      applyTheme(themeModeCookieValue);
    } else {
      const lightModeCookieValue = localStorage.getItem(
        deprecatedLightModeStorageKey,
      );
      if (lightModeCookieValue === 'true') {
        applyTheme('light');
      }
    }
  }, []);

  const updateRemoteSettingsFn = async (settings: Settings, mode: string) => {
    if (userId) {
      const themeMode =
        mode === 'light' ? 'bright' : mode === 'dark' ? 'darcula' : 'auto';
      await updateRemoteSettings({
        ...settings,
        theme: themeMode,
      });
    }
  };

  const setSettings = async (settings: Settings): Promise<void> => {
    await setCachedSettings(settings);
    await updateRemoteSettingsFn(settings, currentTheme);
  };

  const contextData = useMemo<SettingsContextData>(
    () => ({
      ...settings,
      themeMode: currentTheme,
      setTheme: async (theme: string) => {
        applyTheme(theme);
        setCurrentTheme(theme);
        await updateRemoteSettingsFn(settings, theme);
        localStorage.setItem(themeModeStorageKey, theme);
      },
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
      loadedSettings,
    }),
    [settings, loadedSettings, userId, currentTheme],
  );

  return (
    <SettingsContext.Provider value={contextData}>
      {children}
    </SettingsContext.Provider>
  );
};
