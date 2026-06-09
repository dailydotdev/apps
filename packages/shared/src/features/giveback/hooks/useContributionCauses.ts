import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_CAUSES_QUERY } from '../graphql';
import type { ContributionCause } from '../types';

interface UseContributionCauses {
  causes: ContributionCause[];
  isPending: boolean;
}

const MAX_CAUSES = 100;

// Auth + eligibility gated on the backend, so only fetch once we know the
// visitor is signed in and eligible — otherwise the request 403s. The picker is
// only reachable after a logged-in join, so this never runs for anonymous
// visitors.
export const useContributionCauses = (
  enabled: boolean,
): UseContributionCauses => {
  const { isAuthReady, user } = useAuthContext();
  const shouldFetch = isAuthReady && !!user && enabled;

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionCauses),
    queryFn: async () => {
      const res = await gqlClient.request<{
        contributionCauses: Connection<ContributionCause>;
      }>(CONTRIBUTION_CAUSES_QUERY, { first: MAX_CAUSES });

      return res.contributionCauses.edges.map((edge) => edge.node);
    },
    enabled: shouldFetch,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  return { causes: data ?? [], isPending: shouldFetch && isPending };
};
