import { useEffect, useMemo } from 'react';
import { useQuery, useQueryCache } from 'react-query';
import { AnonymousUser, getLoggedUser, LoggedUser } from './user';
import usePersistentState from './usePersistentState';

export default function useLoggedUser(): [
  LoggedUser | null,
  (LoggedUser) => void,
  string,
  boolean,
] {
  const queryKey = 'loggedUser';

  const [cachedUser, setCachedUser] = usePersistentState<
    AnonymousUser | LoggedUser
  >('user', null);

  const cache = useQueryCache();
  const { data: fetchedUser, isLoading } = useQuery(queryKey, getLoggedUser);

  const availableUser = fetchedUser || cachedUser;

  const user = useMemo<LoggedUser | null>(() => {
    if (availableUser && 'providers' in availableUser) {
      return availableUser;
    }
    return null;
  }, [availableUser]);

  const setUser = (user: LoggedUser | AnonymousUser) =>
    cache.setQueryData(queryKey, user);

  const trackingId = useMemo<string | null>(() => availableUser?.id, [
    availableUser,
  ]);

  useEffect(() => {
    if (fetchedUser) {
      setCachedUser(fetchedUser);
    }
  }, [fetchedUser]);

  return [user, setUser, trackingId, isLoading && !availableUser];
}
