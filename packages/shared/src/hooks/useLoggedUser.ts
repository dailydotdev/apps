import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { AnonymousUser, getLoggedUser, LoggedUser } from '../lib/user';
import usePersistentState from './usePersistentState';
import { differenceInMilliseconds } from 'date-fns';

export default function useLoggedUser(
  app: string,
): [
  LoggedUser | null,
  (LoggedUser) => Promise<void>,
  string,
  boolean,
  boolean,
  boolean,
] {
  const queryKey = 'loggedUser';

  const [refreshTokenTimeout, setRefreshTokenTimeout] = useState<number>();
  const [tokenRefreshed, setTokenRefreshed] = useState(false);
  const [cachedUser, setCachedUser, loadedFromCache] = usePersistentState<
    AnonymousUser | LoggedUser
  >('user', null);

  const queryClient = useQueryClient();
  const {
    data: fetchedUser,
    isLoading,
    refetch,
  } = useQuery(queryKey, () => getLoggedUser(app));

  const availableUser = fetchedUser || cachedUser;

  const user = useMemo<LoggedUser | null>(() => {
    if (availableUser && 'providers' in availableUser) {
      return availableUser;
    }
    return null;
  }, [availableUser]);

  const setUser = async (user: LoggedUser | AnonymousUser) => {
    queryClient.setQueryData(queryKey, user);
    await queryClient.invalidateQueries(['profile', user.id]);
  };

  const trackingId = useMemo<string | null>(
    () => availableUser?.id,
    [availableUser],
  );

  useEffect(() => {
    if (fetchedUser) {
      if (refreshTokenTimeout) {
        clearTimeout(refreshTokenTimeout);
      }
      if ('accessToken' in fetchedUser && fetchedUser?.accessToken) {
        const expiresInMillis = differenceInMilliseconds(
          new Date(fetchedUser.accessToken.expiresIn),
          new Date(),
        );
        // Refresh token before it expires
        setRefreshTokenTimeout(
          window.setTimeout(refetch, expiresInMillis - 1000 * 60 * 2),
        );
        // Make sure not persist this value
        fetchedUser.accessToken = undefined;
      }
      setCachedUser(fetchedUser);
      setTokenRefreshed(true);
    }
  }, [fetchedUser]);

  return [
    user,
    setUser,
    trackingId,
    isLoading && !availableUser,
    tokenRefreshed,
    loadedFromCache,
  ];
}
