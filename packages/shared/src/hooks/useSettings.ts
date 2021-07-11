import usePersistentState from './usePersistentState';
import { useEffect, useState } from 'react';
import { SettingsContextData } from '../contexts/SettingsContext';
import { useMutation, useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import {
  RemoteSettings,
  Spaciness,
  UPDATE_USER_SETTINGS_MUTATION,
  USER_SETTINGS_QUERY,
  UserSettingsData,
} from '../graphql/settings';

type Settings = {
  spaciness: Spaciness;
  showOnlyUnreadPosts: boolean;
  openNewTab: boolean;
  insaneMode: boolean;
};

const themeCookieName = 'showmethelight';
const themeModeCookieName = 'showmemymode';
const defaultSettings: Settings = {
  spaciness: 'eco',
  showOnlyUnreadPosts: false,
  openNewTab: true,
  insaneMode: false,
};

function toggleTheme(themeMode: string): void {
  if (themeMode !== 'auto') {
    document.documentElement.classList.remove('auto');
    const lightMode = themeMode === 'light';
    if (lightMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    // Use localStorage for theme to prevent flickering on start up
    localStorage.setItem(themeCookieName, lightMode ? 'true' : 'false');
  } else {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('auto');
  }
}

export default function useSettings(
  userId: string | null,
  canFetchRemote: boolean,
): SettingsContextData {
  const [settings, setCachedSettings, loadedSettings] = usePersistentState(
    'settings',
    defaultSettings,
  );
  const [themeMode, setThemeMode] = useState('dark');
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
      const theme = remoteSettings.userSettings.theme;
      toggleTheme(theme);
      const lightMode = theme === 'bright';
      const darkMode = theme === 'darcula';
      setThemeMode(lightMode ? 'light' : darkMode ? 'dark' : 'auto');
      const cloneSettings = { ...remoteSettings.userSettings };
      delete cloneSettings.theme;
      setCachedSettings(cloneSettings);
    }
  }, [remoteSettings]);

  useEffect(() => {
    const themeModeCookieValue = localStorage.getItem(themeModeCookieName);
    if (themeModeCookieValue) {
      setThemeMode(themeModeCookieValue);
    }
    if (themeModeCookieValue == 'auto') {
      toggleTheme('auto');
    } else {
      const lightModeCookieValue = localStorage.getItem(themeCookieName);
      if (lightModeCookieValue === 'true') {
        document.documentElement.classList.add('light');
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

  const triggerThemeChange = async (
    settings: Settings,
    mode: string,
  ): Promise<void> => {
    await updateRemoteSettingsFn(settings, mode);
  };

  const setSettings = async (settings: Settings): Promise<void> => {
    await setCachedSettings(settings);
    await updateRemoteSettingsFn(settings, themeMode);
  };

  return {
    ...settings,
    themeMode,
    setUIThemeMode: async (mode: string) => {
      toggleTheme(mode);
      triggerThemeChange(settings, mode);
      setThemeMode(mode);
      localStorage.setItem(themeModeCookieName, mode);
    },
    toggleShowOnlyUnreadPosts: () =>
      setSettings({
        ...settings,
        showOnlyUnreadPosts: !settings.showOnlyUnreadPosts,
      }),
    toggleOpenNewTab: () =>
      setSettings({ ...settings, openNewTab: !settings.openNewTab }),
    setSpaciness: (density) => setSettings({ ...settings, spaciness: density }),
    toggleInsaneMode: () =>
      setSettings({ ...settings, insaneMode: !settings.insaneMode }),
    loadedSettings,
  };
}
