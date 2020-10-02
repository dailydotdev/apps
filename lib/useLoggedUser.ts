import { useMemo } from 'react';
import { getLoggedUser, LoggedUser } from './user';
import { useQuery, useQueryCache } from 'react-query';

export default function useLoggedUser(): [
  LoggedUser | null,
  (LoggedUser) => void,
  string,
  boolean,
] {
  const cache = useQueryCache();
  const { data: fetchedUser, isLoading } = useQuery(
    'loggedUser',
    getLoggedUser,
  );

  const user = useMemo<LoggedUser | null>(() => {
    if (fetchedUser && 'providers' in fetchedUser) {
      return fetchedUser;
    }
    return null;
  }, [fetchedUser]);

  const setUser = (user: LoggedUser) =>
    cache.setQueryData<LoggedUser>('loggedUser', user);

  const trackingId = useMemo<string | null>(() => fetchedUser?.id, [
    fetchedUser,
  ]);

  return [user, setUser, trackingId, isLoading && !fetchedUser];
}
