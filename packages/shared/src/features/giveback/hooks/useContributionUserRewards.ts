import { useContributionActions } from './useContributionActions';

interface UseContributionUserRewards {
  // Tier ids the visitor has already claimed.
  claimedRewardIds: string[];
  isPending: boolean;
}

// Thin facade over the combined catalog query (see `useContributionActions`),
// which fetches the visitor's claimed rewards alongside the actions and reward
// tiers in one request. Sharing the query key means the roadmap reuses the
// cached result instead of firing a second request.
export const useContributionUserRewards = (
  enabled: boolean,
): UseContributionUserRewards => {
  const { claimedRewardIds, isPending } = useContributionActions(enabled);

  return { claimedRewardIds, isPending };
};
