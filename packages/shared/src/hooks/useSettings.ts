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

export default function useSettings(
  userId: string | null,
  canFetchRemote: boolean,
): SettingsContextData {
  const [settings, setCachedSettings, loadedSettings] = usePersistentState(
    'settings',
    defaultSettings,
  );
  const [lightMode, setLightMode] = useState(false);

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
  }, []);

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
    lightMode,
    toggleLightMode: async () => {
      setLightMode(!lightMode);
      toggleTheme(!lightMode);
      if (userId) {
        await updateRemoteSettings({
          ...settings,
          theme: !lightMode ? 'bright' : 'darcula',
        });
      }
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
