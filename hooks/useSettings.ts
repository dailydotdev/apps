import usePersistentState from './usePersistentState';
import { useEffect, useState } from 'react';
import { SettingsContextData } from '../contexts/SettingsContext';
import { useMutation, useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import {
  RemoteSettings,
  UPDATE_USER_SETTINGS_MUTATION,
  USER_SETTINGS_QUERY,
  UserSettingsData,
} from '../graphql/settings';

type Settings = {
  spaciness: string;
  showOnlyUnreadPosts: boolean;
  openNewTab: boolean;
};

const themeCookieName = 'showmethelight';
const defaultSettings: Settings = {
  spaciness: 'eco',
  showOnlyUnreadPosts: false,
  openNewTab: true,
};

function toggleTheme(lightMode: boolean): void {
  if (lightMode) {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  document.cookie = `${themeCookieName}=${lightMode};path=/;domain=${
    process.env.NEXT_PUBLIC_DOMAIN
  };samesite=lax;expires=${60 * 60 * 24 * 365 * 10}`;
}

export default function useSettings(
  userId: string | null,
  canFetchRemote: boolean,
): SettingsContextData {
  const [settings, setCachedSettings] = usePersistentState(
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
    const lightModeCookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(themeCookieName))
      ?.split('=')[1];
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
  };
}
