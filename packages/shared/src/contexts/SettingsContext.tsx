import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
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
import usePersistentState from '../hooks/usePersistentState';
import { apiUrl } from '../lib/config';
import { storageWrapper } from '../lib/storageWrapper';

enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  Auto = 'auto',
}

export type SettingsContextData = {
  spaciness: Spaciness;
  themeMode: string;
  showOnlyUnreadPosts: boolean;
  openNewTab: boolean;
  insaneMode: boolean;
  showTopSites: boolean;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleShowOnlyUnreadPosts: () => Promise<void>;
  toggleOpenNewTab: () => Promise<void>;
  setSpaciness: (density: Spaciness) => Promise<void>;
  toggleInsaneMode: () => Promise<void>;
  toggleShowTopSites: () => Promise<void>;
  loadedSettings: boolean;
};

const SettingsContext = React.createContext<SettingsContextData>(null);
export default SettingsContext;

type Settings = {
  spaciness: Spaciness;
  showOnlyUnreadPosts: boolean;
  openNewTab: boolean;
  insaneMode: boolean;
  showTopSites: boolean;
};

const settingsCacheKey = 'settings';
const deprecatedLightModeStorageKey = 'showmethelight';
const themeModeStorageKey = 'theme';
const defaultSettings: Settings = {
  spaciness: 'eco',
  showOnlyUnreadPosts: false,
  openNewTab: true,
  insaneMode: false,
  showTopSites: true,
};

const getThemeMode = (remoteTheme: RemoteTheme): ThemeMode => {
  switch (remoteTheme) {
    case 'bright':
      return ThemeMode.Light;
    case 'darcula':
      return ThemeMode.Dark;
    default:
      return ThemeMode.Auto;
  }
};

const getRemoteTheme = (theme: ThemeMode): RemoteTheme => {
  switch (theme) {
    case ThemeMode.Light:
      return 'bright';
    case ThemeMode.Dark:
      return 'darcula';
    default:
      return ThemeMode.Auto;
  }
};

function applyTheme(themeMode: ThemeMode): void {
  if (document.documentElement.classList.contains(themeMode)) {
    return;
  }

  if (themeMode === ThemeMode.Auto) {
    document.documentElement.classList.remove(ThemeMode.Light);
    document.documentElement.classList.add(ThemeMode.Auto);
    return;
  }

  document.documentElement.classList.remove(ThemeMode.Auto);
  if (themeMode === ThemeMode.Light) {
    document.documentElement.classList.add(ThemeMode.Light);
  } else {
    document.documentElement.classList.remove(ThemeMode.Light);
  }
}

export type SettingsContextProviderProps = {
  children?: ReactNode;
  remoteSettings?: RemoteSettings;
};

export const SettingsContextProvider = ({
  children,
  remoteSettings,
}: SettingsContextProviderProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const userId = user?.id;

  const [settings, setCachedSettings, loadedSettings] = usePersistentState(
    settingsCacheKey,
    defaultSettings,
  );
  const [currentTheme, setCurrentTheme] = useState(ThemeMode.Dark);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const { mutateAsync: updateRemoteSettings } = useMutation<
    unknown,
    unknown,
    RemoteSettings,
    () => Promise<void>
  >(
    (params) =>
      request(`${apiUrl}/graphql`, UPDATE_USER_SETTINGS_MUTATION, {
        data: params,
      }),
    {
      onMutate: (params) => {
        const rollback = Object.keys(params).reduce(
          (values, key) => ({ ...values, [key]: settings[key] }),
          {},
        );

        return () => setCachedSettings({ ...settings, ...rollback });
      },
      onError: (_, __, rollback) => rollback(),
    },
  );

  useEffect(() => {
    if (remoteSettings) {
      const { theme: remoteTheme, ...remoteData } = remoteSettings;
      const theme = getThemeMode(remoteTheme);
      setCurrentTheme(theme);
      storageWrapper.setItem(themeModeStorageKey, theme);
      setCachedSettings(remoteData);
    }
  }, [remoteSettings]);

  useEffect(() => {
    const theme = storageWrapper.getItem(themeModeStorageKey) as ThemeMode;
    if (theme) {
      setCurrentTheme(theme);
    } else {
      const lightMode = storageWrapper.getItem(deprecatedLightModeStorageKey);
      if (lightMode === 'true') {
        applyTheme(ThemeMode.Light);
      }
    }
  }, []);

  const updateRemoteSettingsFn = async (
    newSettings: Settings,
    theme: ThemeMode,
  ): Promise<void> => {
    if (userId) {
      const remoteTheme = getRemoteTheme(theme);
      await updateRemoteSettings({
        ...newSettings,
        theme: remoteTheme,
      });
    }
  };

  const setSettings = async (newSettings: Settings): Promise<void> => {
    await setCachedSettings(newSettings);
    await updateRemoteSettingsFn(newSettings, currentTheme);
  };

  const contextData = useMemo<SettingsContextData>(
    () => ({
      ...settings,
      themeMode: currentTheme,
      setTheme: async (theme: ThemeMode) => {
        setCurrentTheme(theme);
        await updateRemoteSettingsFn(settings, theme);
        storageWrapper.setItem(themeModeStorageKey, theme);
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
      toggleShowTopSites: () =>
        setSettings({ ...settings, showTopSites: !settings.showTopSites }),
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
