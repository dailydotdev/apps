import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { differenceInMilliseconds } from 'date-fns';
import { AccessToken, getBootData } from '../lib/boot';
import { FeaturesContextProvider } from './FeaturesContext';
import { AuthContextProvider } from './AuthContext';
import { AnonymousUser, LoggedUser } from '../lib/user';
import usePersistentState from '../hooks/usePersistentState';

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

function useCacheUser(fetchedUser: LoggedUser | AnonymousUser | undefined): {
  user: LoggedUser | AnonymousUser | undefined;
  updateUser: (LoggedUser) => Promise<void>;
  loadedFromCache: boolean;
} {
  const queryClient = useQueryClient();
  const [cachedUser, setCachedUser, loadedFromCache] = usePersistentState<
    AnonymousUser | LoggedUser
  >('user', null);

  const updateUser = useCallback(
    async (newUser: LoggedUser | AnonymousUser) => {
      await setCachedUser(newUser);
      await queryClient.invalidateQueries(['profile', newUser.id]);
    },
    [queryClient],
  );

  useEffect(() => {
    if (fetchedUser) {
      setCachedUser(fetchedUser);
    }
  }, [fetchedUser]);

  return {
    user: cachedUser,
    loadedFromCache,
    updateUser,
  };
}

const bootQueryKey = 'boot';

export type BootDataProviderProps = {
  children?: ReactNode;
  app: string;
  getRedirectUri: () => string;
};

export const BootDataProvider = ({
  children,
  app,
  getRedirectUri,
}: BootDataProviderProps): ReactElement => {
  const {
    data: bootData,
    refetch,
    dataUpdatedAt,
  } = useQuery(bootQueryKey, () => getBootData(app));

  useRefreshToken(bootData?.accessToken, refetch);
  const { user, updateUser, loadedFromCache } = useCacheUser(bootData?.user);
  const updatedAtActive = user ? dataUpdatedAt : null;

  return (
    <FeaturesContextProvider flags={bootData?.flags}>
      <AuthContextProvider
        user={user}
        updateUser={updateUser}
        tokenRefreshed={updatedAtActive > 0}
        getRedirectUri={getRedirectUri}
        loadingUser={!dataUpdatedAt || !user}
        loadedUserFromCache={loadedFromCache}
        visit={bootData?.visit}
      >
        {children}
      </AuthContextProvider>
    </FeaturesContextProvider>
  );
};
