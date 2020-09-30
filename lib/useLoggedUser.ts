import { useMemo } from 'react';
import { AnonymousUser, LoggedUser } from './user';
import useSWR from 'swr';

export default function useLoggedUser(): [
  LoggedUser | null,
  (LoggedUser) => void,
  string,
  boolean,
] {
  const { data: fetchedUser, isValidating, mutate } = useSWR<
    AnonymousUser | LoggedUser
  >('/api/v1/users/me');

  const user = useMemo<LoggedUser | null>(() => {
    if (fetchedUser && 'providers' in fetchedUser) {
      return fetchedUser;
    }
    return null;
  }, [fetchedUser]);

  const setUser = (user: LoggedUser) => mutate(user);

  const trackingId = useMemo<string | null>(() => fetchedUser?.id, [
    fetchedUser,
  ]);

  return [user, setUser, trackingId, isValidating && !fetchedUser];
}
