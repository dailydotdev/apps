import { useQuery } from '@tanstack/react-query';
import { generateQueryKey, RequestKey } from '../lib/query';
import { getUserDefaultTimezone } from '../lib/timezones';
import { useAuthContext } from '../contexts/AuthContext';
import { UPDATE_USER_PROFILE_MUTATION } from '../graphql/users';
import { useRequestProtocol } from './useRequestProtocol';

export const useEnsureUserTimezone = (): void => {
  const { user, isFetched, updateUser } = useAuthContext();
  const { requestMethod } = useRequestProtocol();

  useQuery({
    queryKey: generateQueryKey(RequestKey.EnsureUserTimezone, user),
    queryFn: async () => {
      const timezone = getUserDefaultTimezone();

      try {
        await requestMethod(UPDATE_USER_PROFILE_MUTATION, {
          data: { timezone },
        });
        await updateUser({ ...user!, timezone });
      } catch {
        return null;
      }

      return timezone;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!user && isFetched && !user.timezone,
  });
};
