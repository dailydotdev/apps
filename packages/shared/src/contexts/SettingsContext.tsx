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

export type SettingsContextData = {
  spaciness: Spaciness;
  themeMode: ThemeMode;
  showOnlyUnreadPosts: boolean;
  openNewTab: boolean;
  insaneMode: boolean;
  showTopSites: boolean;
  sidebarExpanded: boolean;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleShowOnlyUnreadPosts: () => Promise<void>;
  toggleOpenNewTab: () => Promise<void>;
  setSpaciness: (density: Spaciness) => Promise<void>;
  toggleInsaneMode: () => Promise<void>;
  toggleShowTopSites: () => Promise<void>;
  toggleSidebarExpanded: () => Promise<void>;
  loadedSettings: boolean;
};

const SettingsContext = React.createContext<SettingsContextData>(null);
export default SettingsContext;

const deprecatedLightModeStorageKey = 'showmethelight';

const themeModes: Record<RemoteTheme, ThemeMode> = {
  bright: ThemeMode.Light,
  darcula: ThemeMode.Dark,
  auto: ThemeMode.Auto,
};

const remoteThemes: Record<ThemeMode, RemoteTheme> = {
  [ThemeMode.Light]: 'bright',
  [ThemeMode.Dark]: 'darcula',
  [ThemeMode.Auto]: 'auto',
};

function applyTheme(themeMode: ThemeMode): void {
  if (document.documentElement.classList.contains(themeMode)) {
    return;
  }

  document.documentElement.classList.remove(ThemeMode.Light);
  document.documentElement.classList.remove(ThemeMode.Auto);

  if (themeMode === ThemeMode.Dark) {
    return;
  }

  document.documentElement.classList.add(themeMode);
}

export type SettingsContextProviderProps = {
  children?: ReactNode;
  settings?: RemoteSettings;
  updateSettings: (settings: RemoteSettings) => unknown;
  loadedSettings: boolean;
};

const defaultSettings: RemoteSettings = {
  spaciness: 'eco',
  showOnlyUnreadPosts: false,
  openNewTab: true,
  insaneMode: false,
  showTopSites: true,
  sidebarExpanded: true,
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
    const theme = themeModes[settings.theme];
    applyTheme(theme);
  }, [settings.theme]);

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
      loadedSettings,
    }),
    [settings, loadedSettings, userId],
  );

  return (
    <SettingsContext.Provider value={contextData}>
      {children}
    </SettingsContext.Provider>
  );
};
