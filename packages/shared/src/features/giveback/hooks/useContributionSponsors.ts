import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_SPONSORS_QUERY } from '../graphql';
import type { ContributionSponsor } from '../types';

interface UseContributionSponsors {
  sponsors: ContributionSponsor[];
  isPending: boolean;
}

const MAX_SPONSORS = 100;

// Public query: the sponsor wall is campaign social proof and renders for
// everyone. A single page covers the whole wall (no pagination UI here).
export const useContributionSponsors = (): UseContributionSponsors => {
  const { isAuthReady } = useAuthContext();

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionSponsors),
    queryFn: async () => {
      const res = await gqlClient.request<{
        contributionSponsors: Connection<ContributionSponsor>;
      }>(CONTRIBUTION_SPONSORS_QUERY, { first: MAX_SPONSORS });

      return res.contributionSponsors.edges.map((edge) => edge.node);
    },
    enabled: isAuthReady,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  return { sponsors: data ?? [], isPending };
};
