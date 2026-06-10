import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_IMPACT_QUERY } from '../graphql';
import type { ContributionCauseStat, UserContributionReward } from '../types';

interface UseContributionImpact {
  causeStats: ContributionCauseStat[];
  rewards: UserContributionReward[];
  isPending: boolean;
}

const MAX_IMPACT_ROWS = 100;

// The Impact tab's data in one request: the visitor's per-cause funding and the
// rewards they've claimed. Both are backend-gated to onboarded, eligible
// visitors, so only fetch when signed in and the caller marks the tab reachable.
// Keyed by user since every figure is the visitor's own.
export const useContributionImpact = (
  enabled: boolean,
): UseContributionImpact => {
  const { isAuthReady, user } = useAuthContext();
  const shouldFetch = isAuthReady && !!user && enabled;

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionImpact, user),
    queryFn: async () => {
      const res = await gqlClient.request<{
        userContributionCauseStats: Connection<ContributionCauseStat>;
        userContributionRewards: Connection<UserContributionReward>;
      }>(CONTRIBUTION_IMPACT_QUERY, { first: MAX_IMPACT_ROWS });

      return {
        causeStats: res.userContributionCauseStats.edges.map(
          (edge) => edge.node,
        ),
        rewards: res.userContributionRewards.edges.map((edge) => edge.node),
      };
    },
    enabled: shouldFetch,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  return {
    causeStats: data?.causeStats ?? [],
    rewards: data?.rewards ?? [],
    isPending: shouldFetch && isPending,
  };
};
