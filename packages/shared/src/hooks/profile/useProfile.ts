import { useQuery } from '@tanstack/react-query';
import type { PublicProfile } from '../../lib/user';
import { getProfile } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { disabledRefetch } from '../../lib/func';
import { useAuthContext } from '../../contexts/AuthContext';

export function useProfile(initialUser?: PublicProfile): {
  user: PublicProfile | undefined;
  userQueryKey: unknown[];
  isUserSame: boolean;
} {
  const { user: loggedUser } = useAuthContext();
  const userQueryKey = generateQueryKey(RequestKey.Profile, initialUser, {
    id: loggedUser?.id,
  });
  const { data: user } = useQuery({
    queryKey: userQueryKey,
    queryFn: () => {
      if (!initialUser?.id) {
        throw new Error('Initial user id is required');
      }

      return getProfile(initialUser.id);
    },
    ...disabledRefetch,
    staleTime: StaleTime.OneHour,
    initialData: initialUser,
    enabled: !!initialUser?.id,
  });

  return {
    user,
    userQueryKey,
    isUserSame: !!loggedUser && loggedUser.id === initialUser?.id,
  };
}
