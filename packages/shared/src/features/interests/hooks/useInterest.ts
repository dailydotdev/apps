import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { getInterest, getInterestFindings } from '../../../graphql/interests';

export const useInterest = (id: string) => {
  const { user, isAuthReady } = useAuthContext();
  const enabled = isAuthReady && !!user && !!id;

  const interestQuery = useQuery({
    queryKey: generateQueryKey(RequestKey.Interests, user, id),
    queryFn: () => getInterest(id),
    enabled,
  });

  const findingsQuery = useQuery({
    queryKey: generateQueryKey(RequestKey.InterestFindings, user, id),
    queryFn: () => getInterestFindings(id),
    enabled,
  });

  return { interestQuery, findingsQuery };
};
