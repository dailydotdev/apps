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

function toggleTheme(lightMode: boolean): void {
  if (lightMode) {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  // Use localStorage for theme to prevent flickering on start up
  localStorage.setItem(themeCookieName, lightMode ? 'true' : 'false');
}

function isSystemThemeDark(): boolean {
  if (window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // dark mode
      return false;
    } else {
      return true;
    }
  }
  return null;
}

export default function useSettings(
  userId: string | null,
  canFetchRemote: boolean
): SettingsContextData {
  const [settings, setCachedSettings, loadedSettings] = usePersistentState(
    'settings',
    defaultSettings,
  );
  const [lightMode, setLightMode] = useState(false);
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
      const lightMode = remoteSettings.userSettings.theme === 'bright';
      setLightMode(lightMode);
      toggleTheme(lightMode);
      const cloneSettings = { ...remoteSettings.userSettings };
      delete cloneSettings.theme;
      setCachedSettings(cloneSettings);
    }
  }, [remoteSettings]);

  useEffect(() => {
    const lightModeCookieValue = localStorage.getItem(themeCookieName);
    if (lightModeCookieValue === 'true') {
      setLightMode(true);
      document.documentElement.classList.add('light');
    }
    const themeModeCookieValue = localStorage.getItem(themeModeCookieName);
    setThemeMode(themeModeCookieValue);
  }, []);

  const triggerThemeChange = async (isLightMode: boolean): Promise<void> => {
    setLightMode(isLightMode);
    toggleTheme(isLightMode);
    if (userId) {
      await updateRemoteSettings({
        ...settings,
        theme: isLightMode ? 'bright' : 'darcula',
      });
    }

  }

  const setSettings = async (settings: Settings): Promise<void> => {
    await setCachedSettings(settings);
    if (userId) {
      await updateRemoteSettings({
        ...settings,
        theme: lightMode ? 'bright' : 'darcula',
      });
    }
  };

  return {
    ...settings,
    themeMode,
    setUIThemeMode: async (mode: string) => {
      if (mode == 'auto') {
        const isLightMode = isSystemThemeDark();
        triggerThemeChange(isLightMode);
      } else {
        triggerThemeChange(mode == 'light');
      }
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
