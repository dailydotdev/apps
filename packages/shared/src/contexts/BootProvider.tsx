import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { BootApp, BootCacheData, getBootData } from '../lib/boot';
import { FeaturesContextProvider } from './FeaturesContext';
import { AuthContextProvider } from './AuthContext';
import { AnonymousUser, LoggedUser } from '../lib/user';
import { AlertContextProvider } from './AlertContext';
import { generateQueryKey } from '../lib/query';
import {
  applyTheme,
  SettingsContextProvider,
  themeModes,
} from './SettingsContext';
import { storageWrapper as storage } from '../lib/storageWrapper';
import { useRefreshToken } from '../hooks/useRefreshToken';
import { NotificationsContextProvider } from './NotificationsContext';
import { BOOT_LOCAL_KEY, BOOT_QUERY_KEY } from './common';

function filteredProps<T extends Record<string, unknown>>(
  obj: T,
  filteredKeys: (keyof T)[],
): Partial<T> {
  return filteredKeys.reduce((result, key) => {
    return { ...result, [key]: obj[key] };
  }, {});
}

export type BootDataProviderProps = {
  children?: ReactNode;
  app: BootApp;
  localBootData?: BootCacheData;
  getRedirectUri: () => string;
};

export const getLocalBootData = (): BootCacheData | null => {
  const local = storage.getItem(BOOT_LOCAL_KEY);
  if (local) {
    return JSON.parse(storage.getItem(BOOT_LOCAL_KEY)) as BootCacheData;
  }

  return null;
};

const updateLocalBootData = (
  current: Partial<BootCacheData>,
  boot: Partial<BootCacheData>,
) => {
  const localData = { ...current, ...boot, lastModifier: 'extension' };
  const result = filteredProps(localData, [
    'alerts',
    'flags',
    'settings',
    'notifications',
    'user',
    'lastModifier',
  ]);

  storage.setItem(BOOT_LOCAL_KEY, JSON.stringify(result));

  return result;
};

export const BootDataProvider = ({
  children,
  app,
  localBootData,
  getRedirectUri,
}: BootDataProviderProps): ReactElement => {
  const queryClient = useQueryClient();
  const [cachedBootData, setCachedBootData] =
    useState<Partial<BootCacheData>>(localBootData);
  const [lastAppliedChange, setLastAppliedChange] =
    useState<Partial<BootCacheData>>();
  const [initialLoad, setInitialLoad] = useState<boolean>(null);
  const loadedFromCache = !!cachedBootData;
  const {
    user,
    settings,
    flags = {},
    alerts,
    notifications,
  } = cachedBootData || {};
  const {
    data: bootRemoteData,
    refetch,
    isFetched,
    dataUpdatedAt,
  } = useQuery(BOOT_QUERY_KEY, () => getBootData(app));

  useEffect(() => {
    const boot = getLocalBootData();
    if (boot) {
      if (boot?.settings?.theme) {
        applyTheme(themeModes[boot.settings.theme]);
      }

      setCachedBootData(boot);
    }
  }, []);

  const setBootData = (
    updatedBootData: Partial<BootCacheData>,
    update = true,
  ) => {
    const cachedData = JSON.parse(storage.getItem(BOOT_LOCAL_KEY));
    let updatedData = { ...updatedBootData };
    if (update) {
      if (lastAppliedChange) {
        updatedData = { ...lastAppliedChange, ...updatedData };
      }
      setLastAppliedChange(updatedData);
    } else {
      if (cachedData?.lastModifier !== 'companion' && lastAppliedChange) {
        updatedData = { ...updatedData, ...lastAppliedChange };
      }
      setLastAppliedChange(null);
    }
    const updated = updateLocalBootData(cachedData, updatedData);
    setCachedBootData(updated);
  };

  useEffect(() => {
    if (bootRemoteData) {
      setInitialLoad(initialLoad === null);
      // We need to remove the settings for annoymous users as they might have changed them already
      if (!bootRemoteData.user || !('providers' in bootRemoteData.user)) {
        delete bootRemoteData.settings;
      }
      setBootData(bootRemoteData, false);
    }
  }, [bootRemoteData]);

  useRefreshToken(bootRemoteData?.accessToken, refetch);
  const updatedAtActive = user ? dataUpdatedAt : null;

  const updateUser = useCallback(
    async (newUser: LoggedUser | AnonymousUser) => {
      const updated = updateLocalBootData(cachedBootData, { user: newUser });
      setCachedBootData(updated);
      await queryClient.invalidateQueries(generateQueryKey('profile', newUser));
    },
    [queryClient, cachedBootData],
  );

  const updateSettings = useCallback(
    (updatedSettings) => setBootData({ settings: updatedSettings }),
    [setBootData],
  );

  const updateAlerts = useCallback(
    (updatedAlerts) => setBootData({ alerts: updatedAlerts }),
    [setBootData],
  );

  return (
    <FeaturesContextProvider
      flags={flags}
      isFlagsFetched={initialLoad}
      isFeaturesLoaded={loadedFromCache}
    >
      <AuthContextProvider
        user={user}
        updateUser={updateUser}
        tokenRefreshed={updatedAtActive > 0}
        getRedirectUri={getRedirectUri}
        loadingUser={!dataUpdatedAt || !user}
        loadedUserFromCache={loadedFromCache}
        visit={bootRemoteData?.visit}
        refetchBoot={refetch}
        isFetched={isFetched}
        isLegacyLogout={bootRemoteData?.isLegacyLogout}
        firstLoad={initialLoad}
        accessToken={bootRemoteData?.accessToken}
      >
        <SettingsContextProvider
          settings={settings}
          loadedSettings={loadedFromCache}
          updateSettings={updateSettings}
        >
          <AlertContextProvider
            alerts={alerts}
            updateAlerts={updateAlerts}
            loadedAlerts={loadedFromCache}
          >
            <NotificationsContextProvider
              app={app}
              isNotificationsReady={initialLoad}
              unreadCount={notifications?.unreadNotificationsCount}
            >
              {children}
            </NotificationsContextProvider>
          </AlertContextProvider>
        </SettingsContextProvider>
      </AuthContextProvider>
    </FeaturesContextProvider>
  );
};
