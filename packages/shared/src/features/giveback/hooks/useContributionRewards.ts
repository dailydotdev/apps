import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_REWARD_TIERS_QUERY } from '../graphql';
import type { ContributionRewardTier } from '../types';

interface UseContributionRewards {
  rewardTiers: ContributionRewardTier[];
  isPending: boolean;
}

const MAX_TIERS = 100;

// The reward ladder. Auth + eligibility gated on the backend, so only fetch once
// the visitor has joined. Shared between the contribution summary and the
// floating bar, which dedupe to one request via the query key.
export const useContributionRewards = (
  enabled: boolean,
): UseContributionRewards => {
  const { isAuthReady, user } = useAuthContext();
  const shouldFetch = isAuthReady && !!user && enabled;

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionRewards, user),
    queryFn: async () => {
      const res = await gqlClient.request<{
        contributionRewardTiers: Connection<ContributionRewardTier>;
      }>(CONTRIBUTION_REWARD_TIERS_QUERY, { first: MAX_TIERS });

      return res.contributionRewardTiers.edges.map((edge) => edge.node);
    },
    enabled: shouldFetch,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  return {
    rewardTiers: data ?? [],
    isPending: shouldFetch && isPending,
  };
};
