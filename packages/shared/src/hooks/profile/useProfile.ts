import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfile, PublicProfile } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { disabledRefetch } from '../../lib/func';

export function useProfile(initialUser?: PublicProfile): PublicProfile {
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = loggedUser?.id === initialUser?.id;

  const { data: user } = useQuery(
    generateQueryKey(RequestKey.Profile, initialUser),
    () => getProfile(initialUser?.id),
    {
      ...disabledRefetch,
      cacheTime: StaleTime.OneHour,
      initialData: initialUser,
      enabled: !!initialUser && isSameUser,
    },
  );

  return user;
}
