import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
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

  const initialData = useMemo(() => {
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
  }, [localBootData]);

  const logged = initialData?.user as LoggedUser;
  const shouldRefetch = !!logged?.providers && !!logged?.id;
  const lastAppliedChangeRef = useRef<Partial<BootCacheData>>();
  const isInitialFetch = useRef<boolean>();

  const {
    data: bootData,
    error,
    refetch,
    isFetched,
    isError,
    dataUpdatedAt,
  } = useQuery<Partial<Boot>>(
    BOOT_QUERY_KEY,
    async () => {
      const result = await getBootData(app);
      preloadFeedsRef.current({ feeds: result.feeds, user: result.user });
      updateLocalBootData(bootData || {}, result);
      isInitialFetch.current = isInitialFetch.current === undefined;

      return result;
    },
    {
      refetchOnWindowFocus: shouldRefetch,
      staleTime: STALE_TIME,
      enabled: !isExtension || !!hostGranted,
      placeholderData: initialData,
    },
  );

  const isBootReady = isFetched && !isError;
  const loadedFromCache = !!bootData;
  const { user, settings, alerts, notifications, squads } = bootData || {};

  useRefreshToken(bootData?.accessToken, refetch);
  const updatedAtActive = user ? dataUpdatedAt : null;
  const updateQueryCache = useCallback(
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
      queryClient.setQueryData(BOOT_QUERY_KEY, updated);
    },
    [queryClient],
  );

  const updateUser = useCallback(
    async (newUser: LoggedUser | AnonymousUser) => {
      updateQueryCache({ user: newUser });
      await queryClient.invalidateQueries(
        generateQueryKey(RequestKey.Profile, newUser),
      );
    },
    [updateQueryCache, queryClient],
  );

  const updateSettings = useCallback(
    (updatedSettings) => updateQueryCache({ settings: updatedSettings }),
    [updateQueryCache],
  );

  const updateAlerts = useCallback(
    (updatedAlerts) => updateQueryCache({ alerts: updatedAlerts }),
    [updateQueryCache],
  );

  const updateExperimentation = useCallback(
    (exp: BootCacheData['exp']) => {
      updateLocalBootData(bootData, { exp });
    },
    [bootData],
  );

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
      experimentation={bootData?.exp}
      updateExperimentation={updateExperimentation}
    >
      <AuthContextProvider
        user={user}
        updateUser={updateUser}
        tokenRefreshed={updatedAtActive > 0}
        getRedirectUri={getRedirectUri}
        loadingUser={!dataUpdatedAt || !user}
        loadedUserFromCache={loadedFromCache}
        visit={bootData?.visit}
        refetchBoot={refetch}
        isFetched={isBootReady}
        isLegacyLogout={bootData?.isLegacyLogout}
        accessToken={bootData?.accessToken}
        isPastRegistration={isInitialFetch.current}
        squads={squads}
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
              <NotificationsContextProvider
                isNotificationsReady={isBootReady}
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
