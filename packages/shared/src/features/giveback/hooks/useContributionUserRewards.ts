import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_USER_REWARDS_QUERY } from '../graphql';
import type { UserContributionReward } from '../types';

interface UseContributionUserRewards {
  rewards: UserContributionReward[];
  isPending: boolean;
}

const MAX_REWARDS = 100;

// The visitor's claimed rewards, used to mark roadmap nodes as claimed. Backend
// gated to onboarded, eligible visitors, so only fetch when signed in and the
// caller marks the surface reachable. Keyed by user since it's their own.
export const useContributionUserRewards = (
  enabled: boolean,
): UseContributionUserRewards => {
  const { isAuthReady, user } = useAuthContext();
  const shouldFetch = isAuthReady && !!user && enabled;

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionUserRewards, user),
    queryFn: async () => {
      const res = await gqlClient.request<{
        userContributionRewards: Connection<UserContributionReward>;
      }>(CONTRIBUTION_USER_REWARDS_QUERY, { first: MAX_REWARDS });

      return res.userContributionRewards.edges.map((edge) => edge.node);
    },
    enabled: shouldFetch,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  return {
    rewards: data ?? [],
    isPending: shouldFetch && isPending,
  };
};
