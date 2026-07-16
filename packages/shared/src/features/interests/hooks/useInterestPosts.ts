import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { getInterestPosts } from '../../../graphql/interests';

export const useInterestPosts = (id: string) => {
  const { user, isAuthReady } = useAuthContext();

  return useQuery({
    queryKey: generateQueryKey(RequestKey.InterestFindings, user, id, 'posts'),
    queryFn: () => getInterestPosts(id),
    enabled: isAuthReady && !!user && !!id,
  });
};
