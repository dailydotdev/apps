import { useQuery } from '@tanstack/react-query';
import { getProfile, PublicProfile } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { disabledRefetch } from '../../lib/func';
import { useAuthContext } from '../../contexts/AuthContext';

export function useProfile(initialUser?: PublicProfile): {
  user: PublicProfile;
  userQueryKey: unknown[];
} {
  const { user: loggedUser } = useAuthContext();
  const userQueryKey = generateQueryKey(RequestKey.Profile, initialUser, {
    id: loggedUser?.id,
  });
  const { data: user } = useQuery(
    userQueryKey,
    () => getProfile(initialUser?.id),
    {
      ...disabledRefetch,
      cacheTime: StaleTime.OneHour,
      initialData: initialUser,
      enabled: !!initialUser?.id,
    },
  );

  return {
    user,
    userQueryKey,
  };
}
