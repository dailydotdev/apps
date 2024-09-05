import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import AuthContext from '../../contexts/AuthContext';
import { disabledRefetch } from '../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { getProfile, PublicProfile } from '../../lib/user';

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
