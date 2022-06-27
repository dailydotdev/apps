import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { BootCacheData, getBootData } from '../lib/boot';
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

export const BOOT_LOCAL_KEY = 'boot:local';
export const BOOT_QUERY_KEY = 'boot';

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
  app: string;
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
  const loadedFromCache = cachedBootData !== undefined;
  const { user, settings, flags = {}, alerts } = cachedBootData || {};
  const {
    data: bootRemoteData,
    refetch,
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
    [queryClient],
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
    <FeaturesContextProvider flags={flags}>
      <AuthContextProvider
        user={user}
        updateUser={updateUser}
        tokenRefreshed={updatedAtActive > 0}
        getRedirectUri={getRedirectUri}
        loadingUser={!dataUpdatedAt || !user}
        loadedUserFromCache={loadedFromCache}
        visit={bootRemoteData?.visit}
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
            {children}
          </AlertContextProvider>
        </SettingsContextProvider>
      </AuthContextProvider>
    </FeaturesContextProvider>
  );
};
