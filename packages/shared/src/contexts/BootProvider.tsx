import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { differenceInMilliseconds } from 'date-fns';
import { AccessToken, BootCacheData, getBootData } from '../lib/boot';
import FeaturesContext from './FeaturesContext';
import { AuthContextProvider } from './AuthContext';
import { AnonymousUser, LoggedUser } from '../lib/user';
import { AlertContextProvider } from './AlertContext';
import { generateQueryKey } from '../lib/query';
import { SettingsContextProvider } from './SettingsContext';
import { storageWrapper as storage } from '../lib/storageWrapper';

function useRefreshToken(
  accessToken: AccessToken,
  refresh: () => Promise<unknown>,
) {
  const [refreshTokenTimeout, setRefreshTokenTimeout] = useState<number>();

  useEffect(() => {
    if (accessToken) {
      if (refreshTokenTimeout) {
        clearTimeout(refreshTokenTimeout);
      }
      const expiresInMillis = differenceInMilliseconds(
        new Date(accessToken.expiresIn),
        new Date(),
      );
      // Refresh token before it expires
      setRefreshTokenTimeout(
        window.setTimeout(refresh, expiresInMillis - 1000 * 60 * 2),
      );
    }
  }, [accessToken, refresh]);
}

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
  getRedirectUri: () => string;
};

const getLocalBootData = () => {
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
  const localData = { ...current, ...boot };
  const result = filteredProps(localData, [
    'alerts',
    'flags',
    'settings',
    'user',
  ]);

  storage.setItem(BOOT_LOCAL_KEY, JSON.stringify(result));

  return result;
};

export const BootDataProvider = ({
  children,
  app,
  getRedirectUri,
}: BootDataProviderProps): ReactElement => {
  const queryClient = useQueryClient();
  const [cachedBootData, setCachedBootData] =
    useState<Partial<BootCacheData>>();
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
      setCachedBootData(boot);
    }
  }, []);

  const setBootData = (
    updatedBootData: Partial<BootCacheData>,
    update = true,
  ) => {
    let updatedData = { ...updatedBootData };
    if (update) {
      if (lastAppliedChange) {
        updatedData = { ...lastAppliedChange, ...updatedData };
      }
      setLastAppliedChange(updatedData);
    } else {
      if (lastAppliedChange) {
        updatedData = { ...updatedData, ...lastAppliedChange };
      }
      setLastAppliedChange(null);
    }

    const updated = updateLocalBootData(cachedBootData, updatedData);
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
    <FeaturesContext.Provider value={{ flags }}>
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
    </FeaturesContext.Provider>
  );
};
