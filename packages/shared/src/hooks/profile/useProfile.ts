import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfile, PublicProfile } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';

export function useProfile(initialUser?: PublicProfile): PublicProfile {
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = loggedUser?.id === initialUser?.id;

  const { data: user } = useQuery(
    generateQueryKey(RequestKey.Profile, initialUser),
    () => getProfile(initialUser?.id),
    {
      placeholderData: initialUser,
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      // Make sure the logged in user's profile is always up to date
      enabled: !!initialUser && isSameUser,
    },
  );

  return user;
}
