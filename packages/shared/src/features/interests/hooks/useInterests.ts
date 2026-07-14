import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { getInterests } from '../../../graphql/interests';

export const useInterests = () => {
  const { user, isAuthReady } = useAuthContext();

  return useQuery({
    queryKey: generateQueryKey(RequestKey.Interests, user),
    queryFn: getInterests,
    enabled: isAuthReady && !!user,
    staleTime: 0,
  });
};
