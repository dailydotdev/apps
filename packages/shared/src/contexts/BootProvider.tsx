import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import type { Boot, BootApp, BootCacheData } from '../lib/boot';
import { getBootData } from '../lib/boot';
import { AuthContextProvider } from './AuthContext';
import type { AnonymousUser, LoggedUser } from '../lib/user';
import { AlertContextProvider } from './AlertContext';
import { generateQueryKey, RequestKey, STALE_TIME } from '../lib/query';
import {
  applyTheme,
  SettingsContextProvider,
  themeModes,
} from './SettingsContext';
import { storageWrapper as storage } from '../lib/storageWrapper';
import { useRefreshToken } from '../hooks/useRefreshToken';
import useDebounceFn from '../hooks/useDebounceFn';
import { NotificationsContextProvider } from './NotificationsContext';
import { BOOT_LOCAL_KEY, BOOT_QUERY_KEY } from './common';
import { GrowthBookProvider } from '../components/GrowthBookProvider';
import { useHostStatus } from '../hooks/useHostPermissionStatus';
import { checkIsExtension, isIOSNative } from '../lib/func';
import type { Feed, FeedList } from '../graphql/feed';
import type { ApiErrorResult } from '../graphql/common';
import { ApiError, getApiError, gqlClient } from '../graphql/common';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LogContextProvider } from './LogContext';
import { REQUEST_APP_ACCOUNT_TOKEN_MUTATION } from '../graphql/users';
import { isConnectionError } from '../lib/errors';
import { EngagementAdsProvider } from './EngagementAdsContext';

const ServerError = dynamic(
  () =>
    import(
      /* webpackChunkName: "serverError" */ '../components/errors/ServerError'
    ),
);

const ConnectionError = dynamic(
  () =>
    import(
      /* webpackChunkName: "connectionError" */ '../components/errors/ConnectionError'
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
    return JSON.parse(local) as BootCacheData;
  }

  return null;
};

const updateLocalBootData = (
  current: Partial<BootCacheData> | undefined,
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
    'geo',
    'isAndroidApp',
  ]);

  storage.setItem(BOOT_LOCAL_KEY, JSON.stringify(result));

  return result;
};

const getCachedOrNull = () => {
  try {
    // catch below fallbacks falsy values
    return JSON.parse(storage.getItem(BOOT_LOCAL_KEY) as string);
  } catch (err) {
    return null;
  }
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
  const queryClient = useQueryClient();
  const preloadFeedsFn: PreloadFeeds = ({ feeds, user }) => {
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
  const preloadFeedsRef = useRef(preloadFeedsFn);
  preloadFeedsRef.current = preloadFeedsFn;

  const [initialLoad, setInitialLoad] = useState<boolean>();
  const [cachedBootData, setCachedBootData] = useState<Partial<Boot>>();

  useEffect(() => {
    if (localBootData) {
      setCachedBootData(localBootData);

      return;
    }

    const boot = getLocalBootData();

    if (!boot) {
      setCachedBootData(undefined);

      return;
    }

    if (boot?.settings?.theme) {
      applyTheme(themeModes[boot.settings.theme]);
    }

    preloadFeedsRef.current({ feeds: boot.feeds, user: boot.user });

    setCachedBootData(boot);
  }, [localBootData]);

  const { hostGranted } = useHostStatus();
  const isExtension = checkIsExtension();
  const logged = cachedBootData?.user as LoggedUser;
  const shouldRefetch = !!logged?.providers && !!logged?.id;
  const lastAppliedChangeRef = useRef<Partial<BootCacheData>>();

  const {
    data: remoteData,
    error,
    refetch,
    isFetched,
    isError,
    dataUpdatedAt,
  } = useQuery<Partial<Boot>>({
    queryKey: BOOT_QUERY_KEY,
    queryFn: async () => {
      const pathname = globalThis?.location?.pathname;
      const result = await getBootData({ app, pathname });
      preloadFeedsRef.current({ feeds: result.feeds, user: result.user });

      return result;
    },
    refetchOnWindowFocus: shouldRefetch,
    staleTime: STALE_TIME,
    enabled: !isExtension || !!hostGranted,
  });

  const isBootReady = isFetched && !isError;
  const loadedFromCache = !!cachedBootData;
  const { user, settings, alerts, notifications, squads, geo, isAndroidApp } =
    cachedBootData || {};

  useRefreshToken(remoteData?.accessToken, refetch);

  const [debouncedRefetch] = useDebounceFn(refetch, 200, 1000 * 60);

  useEffect(() => {
    // subscribe to forbidden errors and in case token expired at the
    // time of error refetch boot to get the new one
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated' || event.action.type !== 'error') {
        return;
      }

      const err = event.action.error as unknown as ApiErrorResult;

      if (!getApiError(err, ApiError.Forbidden)) {
        return;
      }

      const expiresIn = remoteData?.accessToken?.expiresIn;

      if (expiresIn && new Date(expiresIn) < new Date()) {
        debouncedRefetch();
      }
    });

    return unsubscribe;
  }, [queryClient, remoteData?.accessToken?.expiresIn, debouncedRefetch]);

  const updatedAtActive = user ? dataUpdatedAt : 0;
  const updateBootData = useCallback(
    (updatedBootData: Partial<BootCacheData>, update = true) => {
      const cachedData = getCachedOrNull() || {};
      const lastAppliedChange = lastAppliedChangeRef.current;
      const params = new URLSearchParams(globalThis?.location?.search);
      let updatedData = {
        ...updatedBootData,
        isAndroidApp:
          cachedData?.isAndroidApp || Boolean(params.get('android')),
      };

      if (update) {
        if (lastAppliedChange) {
          updatedData = { ...lastAppliedChange, ...updatedData };
        }
        lastAppliedChangeRef.current = updatedData;
      } else {
        if (cachedData?.lastModifier !== 'companion' && lastAppliedChange) {
          updatedData = { ...updatedData, ...lastAppliedChange };
        }
        lastAppliedChangeRef.current = undefined;
      }

      const updated = updateLocalBootData(cachedData, updatedData);
      setCachedBootData(updated);
    },
    [],
  );

  const updateUser = useCallback(
    async (newUser: LoggedUser | AnonymousUser) => {
      updateBootData({ user: newUser });
      await queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Profile, newUser),
      });
    },
    [updateBootData, queryClient],
  );

  const updateSettings = useCallback(
    (updatedSettings: BootCacheData['settings']) =>
      updateBootData({ settings: updatedSettings }),
    [updateBootData],
  );

  const updateAlerts = useCallback(
    (updatedAlerts: BootCacheData['alerts']) =>
      updateBootData({ alerts: updatedAlerts }),
    [updateBootData],
  );

  const updateExperimentation = useCallback(
    (exp: BootCacheData['exp']) => {
      updateLocalBootData(cachedBootData, { exp });
    },
    [cachedBootData],
  );

  if (logged?.language && logged?.isPlus) {
    gqlClient.setHeader('content-language', logged.language as string);
  } else {
    gqlClient.unsetHeader('content-language');
  }

  useEffect(() => {
    if (remoteData) {
      setInitialLoad(typeof initialLoad === 'undefined');
      updateBootData(remoteData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteData]);

  // invalidate forbidden queries when token refreshes to recover from
  // any auth errors due to token being expired after inactivity
  useEffect(() => {
    if (!remoteData?.accessToken?.token) {
      return;
    }

    queryClient.invalidateQueries({
      predicate: (query) => {
        if (query.state.status !== 'error') {
          return false;
        }

        const err = query.state.error as unknown as ApiErrorResult;

        return !!getApiError(err, ApiError.Forbidden);
      },
    });
  }, [remoteData?.accessToken?.token, queryClient]);

  useEffect(() => {
    if (
      isIOSNative() &&
      shouldRefetch &&
      !logged?.subscriptionFlags?.appAccountToken
    ) {
      gqlClient
        .request<{ requestAppAccountToken: string }>(
          REQUEST_APP_ACCOUNT_TOKEN_MUTATION,
        )
        .then((result) => {
          updateBootData({
            user: {
              ...logged,
              subscriptionFlags: {
                ...logged.subscriptionFlags,
                appAccountToken: result.requestAppAccountToken,
              },
            },
          });
        });
    }
  }, [logged, shouldRefetch, updateBootData]);

  if (error) {
    const isNetworkError = isConnectionError(error);
    return (
      <div className="mx-2 flex h-screen items-center justify-center">
        {isNetworkError ? (
          <ConnectionError onRetry={() => refetch()} />
        ) : (
          <ServerError />
        )}
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
        visit={remoteData?.visit}
        refetchBoot={refetch}
        isFetched={isBootReady}
        accessToken={remoteData?.accessToken}
        squads={squads}
        firstLoad={initialLoad}
        geo={geo}
        isAndroidApp={isAndroidApp}
      >
        <SettingsContextProvider
          settings={settings}
          loadedSettings={loadedFromCache}
          updateSettings={updateSettings}
        >
          <EngagementAdsProvider rawCreatives={remoteData?.engagementCreatives}>
            <AlertContextProvider
              alerts={alerts}
              isFetched={isBootReady}
              updateAlerts={updateAlerts}
              loadedAlerts={loadedFromCache}
            >
              <LogContextProvider
                app={app}
                version={version}
                getPage={getPage}
                deviceId={deviceId}
              >
                <ErrorBoundary>
                  <NotificationsContextProvider
                    isNotificationsReady={isBootReady}
                    unreadCount={notifications?.unreadNotificationsCount}
                  >
                    {children}
                  </NotificationsContextProvider>
                </ErrorBoundary>
              </LogContextProvider>
            </AlertContextProvider>
          </EngagementAdsProvider>
        </SettingsContextProvider>
      </AuthContextProvider>
    </GrowthBookProvider>
  );
};
