import { useContributionActions } from './useContributionActions';
import type { ContributionRewardTier } from '../types';

interface UseContributionRewards {
  rewardTiers: ContributionRewardTier[];
  isPending: boolean;
}

// Thin facade over the combined catalog query (see `useContributionActions`),
// which fetches the reward tiers alongside the actions in one request. Sharing
// the query key means the summary and floating bar reuse the cached result
// instead of firing a second request.
export const useContributionRewards = (
  enabled: boolean,
): UseContributionRewards => {
  const { rewardTiers, isPending } = useContributionActions(enabled);

  return { rewardTiers, isPending };
};
