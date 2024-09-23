import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getProfile, PublicProfile } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { disabledRefetch } from '../../lib/func';

export function useProfile(initialUser?: PublicProfile): {
  user: PublicProfile;
  userQueryKey: unknown[];
} {
  const userQueryKey = generateQueryKey(RequestKey.Profile, initialUser);
  const { data: user } = useQuery(
    userQueryKey,
    () => getProfile(initialUser?.id),
    {
      ...disabledRefetch,
      cacheTime: StaleTime.OneHour,
      initialData: initialUser,
    },
  );

  return useMemo(
    () => ({
      user,
      userQueryKey,
    }),
    [user, userQueryKey],
  );
}
