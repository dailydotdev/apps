import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_ACTIONS_QUERY } from '../graphql';
import type {
  ContributionAction,
  ContributionActionCategory,
  ContributionFoundingAward,
  ContributionRewardTier,
} from '../types';

interface UseContributionActions {
  actions: ContributionAction[];
  categories: ContributionActionCategory[];
  rewardTiers: ContributionRewardTier[];
  // Tier ids the visitor has already claimed, for the roadmap's claimed state.
  claimedRewardIds: string[];
  // The founding-award state, carried on the same request (see the query).
  foundingAward?: ContributionFoundingAward;
  isPending: boolean;
}

const MAX_ACTIONS = 100;

// The onboarded experience's data in one request: the action catalog, its filter
// categories, and the reward ladder. Auth + eligibility gated on the backend
// (this only renders once a visitor has joined and picked causes), so only fetch
// when signed in and the caller marks the tab reachable. Keyed by user since each
// action carries the visitor's own completion state.
export const useContributionActions = (
  enabled: boolean,
): UseContributionActions => {
  const { isAuthReady, user } = useAuthContext();
  const shouldFetch = isAuthReady && !!user && enabled;

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionActions, user),
    queryFn: async () => {
      const res = await gqlClient.request<{
        contributionActions: Connection<ContributionAction>;
        contributionActionCategories: Connection<ContributionActionCategory>;
        contributionRewardTiers: Connection<ContributionRewardTier>;
        userContributionRewards: Connection<{ tier: { id: string } }>;
        contributionFoundingAward: ContributionFoundingAward;
      }>(CONTRIBUTION_ACTIONS_QUERY, { first: MAX_ACTIONS });

      return {
        actions: res.contributionActions.edges.map((edge) => edge.node),
        categories: res.contributionActionCategories.edges.map(
          (edge) => edge.node,
        ),
        rewardTiers: res.contributionRewardTiers.edges.map((edge) => edge.node),
        claimedRewardIds: res.userContributionRewards.edges.map(
          (edge) => edge.node.tier.id,
        ),
        foundingAward: res.contributionFoundingAward,
      };
    },
    enabled: shouldFetch,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  return {
    actions: data?.actions ?? [],
    categories: data?.categories ?? [],
    rewardTiers: data?.rewardTiers ?? [],
    claimedRewardIds: data?.claimedRewardIds ?? [],
    foundingAward: data?.foundingAward,
    isPending: shouldFetch && isPending,
  };
};
