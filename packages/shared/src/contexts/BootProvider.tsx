import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Boot, BootApp, BootCacheData, getBootData } from '../lib/boot';
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
import { GrowthBookProvider } from '../components/GrowthBookProvider';
import { useHostStatus } from '../hooks/useHostPermissionStatus';
import { checkIsExtension } from '../lib/func';
import { Feed, FeedList } from '../graphql/feed';
import { gqlClient } from '../graphql/common';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LogContextProvider } from './LogContext';
import { PaymentContextProvider } from './PaymentContext';

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

const getCachedOrNull = () => {
  try {
    return JSON.parse(storage.getItem(BOOT_LOCAL_KEY));
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

  const [initialLoad, setInitialLoad] = useState<boolean>(null);
  const [cachedBootData, setCachedBootData] = useState<Partial<Boot>>(() => {
    if (localBootData) {
      return localBootData;
    }

    const boot = getLocalBootData();

    if (!boot) {
      return null;
    }

    if (boot?.settings?.theme) {
      applyTheme(themeModes[boot.settings.theme]);
    }

    preloadFeedsRef.current({ feeds: boot.feeds, user: boot.user });

    return boot;
  });
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
      const result = await getBootData(app);
      preloadFeedsRef.current({ feeds: result.feeds, user: result.user });

      return result;
    },
    refetchOnWindowFocus: shouldRefetch,
    staleTime: STALE_TIME,
    enabled: !isExtension || !!hostGranted,
  });

  const isBootReady = isFetched && !isError;
  const loadedFromCache = !!cachedBootData;
  const { user, settings, alerts, notifications, squads } =
    cachedBootData || {};

  useRefreshToken(remoteData?.accessToken, refetch);
  const updatedAtActive = user ? dataUpdatedAt : null;
  const updateBootData = useCallback(
    (updatedBootData: Partial<BootCacheData>, update = true) => {
      const cachedData = getCachedOrNull() || {};
      const lastAppliedChange = lastAppliedChangeRef.current;
      let updatedData = { ...updatedBootData };
      if (update) {
        if (lastAppliedChange) {
          updatedData = { ...lastAppliedChange, ...updatedData };
        }
        lastAppliedChangeRef.current = updatedData;
      } else {
        if (cachedData?.lastModifier !== 'companion' && lastAppliedChange) {
          updatedData = { ...updatedData, ...lastAppliedChange };
        }
        lastAppliedChangeRef.current = null;
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
    (updatedSettings) => updateBootData({ settings: updatedSettings }),
    [updateBootData],
  );

  const updateAlerts = useCallback(
    (updatedAlerts) => updateBootData({ alerts: updatedAlerts }),
    [updateBootData],
  );

  const updateExperimentation = useCallback(
    (exp: BootCacheData['exp']) => {
      updateLocalBootData(cachedBootData, { exp });
    },
    [cachedBootData],
  );

  gqlClient.setHeader(
    'content-language',
    (user as Partial<LoggedUser>)?.language || ContentLanguage.English,
  );

  useEffect(() => {
    if (remoteData) {
      setInitialLoad(initialLoad === null);
      updateBootData(remoteData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteData]);

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
        visit={remoteData?.visit}
        refetchBoot={refetch}
        isFetched={isBootReady}
        isLegacyLogout={remoteData?.isLegacyLogout}
        accessToken={remoteData?.accessToken}
        squads={squads}
        firstLoad={initialLoad}
      >
        <SettingsContextProvider
          settings={settings}
          loadedSettings={loadedFromCache}
          updateSettings={updateSettings}
        >
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
                  <PaymentContextProvider>{children}</PaymentContextProvider>
                </NotificationsContextProvider>
              </ErrorBoundary>
            </LogContextProvider>
          </AlertContextProvider>
        </SettingsContextProvider>
      </AuthContextProvider>
    </GrowthBookProvider>
  );
};
