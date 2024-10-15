import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { BootApp, BootCacheData, getBootData } from '../lib/boot';
import { AuthContextProvider } from './AuthContext';
import { AnonymousUser, ContentLanguage, LoggedUser } from '../lib/user';
import { AlertContextProvider } from './AlertContext';
import { generateQueryKey, RequestKey, STALE_TIME } from '../lib/query';
import {
  applyTheme,
  SettingsContextProvider,
  themeModes,
} from './SettingsContext';
import { storageWrapper as storage } from '../lib/storageWrapper';
import { useRefreshToken } from '../hooks/useRefreshToken';
import { NotificationsContextProvider } from './NotificationsContext';
import { BOOT_LOCAL_KEY, BOOT_QUERY_KEY } from './common';
import { LogContextProvider } from './LogContext';
import { GrowthBookProvider } from '../components/GrowthBookProvider';
import { useHostStatus } from '../hooks/useHostPermissionStatus';
import { checkIsExtension } from '../lib/func';
import { Feed, FeedList } from '../graphql/feed';
import { gqlClient } from '../graphql/common';

const ServerError = dynamic(
  () =>
    import(
      /* webpackChunkName: "serverError" */ '../components/errors/ServerError'
    ),
);

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
  version: string;
  deviceId: string;
  localBootData?: BootCacheData;
  getPage: () => string;
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
    'settings',
    'notifications',
    'user',
    'lastModifier',
    'squads',
    'exp',
    'feeds',
  ]);

  storage.setItem(BOOT_LOCAL_KEY, JSON.stringify(result));

  return result;
};

export type PreloadFeeds = ({
  feeds,
  user,
}: {
  feeds?: Feed[];
  user?: Pick<LoggedUser, 'id'>;
}) => void;

export const BootDataProvider = ({
  children,
  app,
  version,
  deviceId,
  localBootData,
  getRedirectUri,
  getPage,
}: BootDataProviderProps): ReactElement => {
  console.log('BootProvider');
  const { hostGranted } = useHostStatus();
  const isExtension = checkIsExtension();
  const queryClient = useQueryClient();

  const preloadFeedsRef = useRef<PreloadFeeds>();
  preloadFeedsRef.current = ({ feeds, user }) => {
    if (!feeds || !user) {
      return;
    }

    queryClient.setQueryData<FeedList['feedList']>(
      generateQueryKey(RequestKey.Feeds, user),
      {
        edges: feeds.map((item) => ({ node: item })),
        pageInfo: {
          hasNextPage: false,
        },
      },
    );
  };

  const [cachedBootData, setCachedBootData] = useState<Partial<BootCacheData>>(
    () => {
      if (localBootData) {
        return localBootData;
      }

      const boot = getLocalBootData();

      if (boot) {
        if (boot?.settings?.theme) {
          applyTheme(themeModes[boot.settings.theme]);
        }

        preloadFeedsRef.current({ feeds: boot.feeds, user: boot.user });
      }

      return boot;
    },
  );
  const [lastAppliedChange, setLastAppliedChange] =
    useState<Partial<BootCacheData>>();
  const loadedFromCache = !!cachedBootData;
  const logged = cachedBootData?.user as LoggedUser;
  const shouldRefetch =
    !!cachedBootData?.user && !!logged?.providers && !!logged?.id;

  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const {
    data: bootRemoteData,
    error,
    refetch,
    isFetched,
    dataUpdatedAt,
  } = useQuery(
    BOOT_QUERY_KEY,
    async () => {
      const result = await getBootData(app);
      preloadFeedsRef.current({ feeds: result.feeds, user: result.user });
      setBootData(result, false);

      return result;
    },
    {
      refetchOnWindowFocus: shouldRefetch,
      staleTime: STALE_TIME,
      enabled: isExtension ? !!hostGranted : true,
    },
  );

  const { user, settings, alerts, notifications, squads } =
    bootRemoteData || cachedBootData || {};

  useRefreshToken(bootRemoteData?.accessToken, refetch);
  const updatedAtActive = user ? dataUpdatedAt : null;

  const updateUser = useCallback(
    async (newUser: LoggedUser | AnonymousUser) => {
      const updated = updateLocalBootData(cachedBootData, { user: newUser });
      setCachedBootData(updated);
      await queryClient.invalidateQueries(
        generateQueryKey(RequestKey.Profile, newUser),
      );
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

  const updateExperimentation = useCallback((exp: BootCacheData['exp']) => {
    setCachedBootData((cachedData) => updateLocalBootData(cachedData, { exp }));
  }, []);

  gqlClient.setHeader(
    'content-language',
    (user as Partial<LoggedUser>)?.language || ContentLanguage.English,
  );

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ServerError />
      </div>
    );
  }

  return (
    <GrowthBookProvider
      app={app}
      user={user}
      deviceId={deviceId}
      experimentation={cachedBootData?.exp}
      updateExperimentation={updateExperimentation}
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
        accessToken={bootRemoteData?.accessToken}
        squads={squads}
      >
        <SettingsContextProvider
          settings={settings}
          loadedSettings={loadedFromCache}
          updateSettings={updateSettings}
        >
          <AlertContextProvider
            alerts={alerts}
            isFetched={isFetched}
            updateAlerts={updateAlerts}
            loadedAlerts={loadedFromCache}
          >
            <LogContextProvider
              app={app}
              version={version}
              getPage={getPage}
              deviceId={deviceId}
            >
              <NotificationsContextProvider
                isNotificationsReady={isFetched}
                unreadCount={notifications?.unreadNotificationsCount}
              >
                {children}
              </NotificationsContextProvider>
            </LogContextProvider>
          </AlertContextProvider>
        </SettingsContextProvider>
      </AuthContextProvider>
    </GrowthBookProvider>
  );
};
