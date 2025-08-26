import { useQuery } from '@tanstack/react-query';
import { generateQueryKey, RequestKey } from '../lib/query';
import type { LoggedUser } from '../lib/user';
import { useAuthContext } from '../contexts/AuthContext';
import { useRequestProtocol } from './useRequestProtocol';
import { CHECK_LOCATION_QUERY } from '../graphql/users';

export const useCheckLocation = (): void => {
  const { user, isFetched, updateUser } = useAuthContext();
  const { requestMethod } = useRequestProtocol();

  useQuery({
    queryKey: generateQueryKey(RequestKey.CheckLocation, user),
    queryFn: async () => {
      const result = await requestMethod<{
        location: Pick<LoggedUser, 'hasLocationSet'>;
      }>(CHECK_LOCATION_QUERY);
      await updateUser({
        ...user,
        hasLocationSet: !!result,
      });
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!user && isFetched && !user.hasLocationSet,
  });
};
