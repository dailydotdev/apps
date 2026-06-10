import { useMemo } from 'react';
import { useContributionStatus } from './useContributionStatus';
import { useContributionRewards } from './useContributionRewards';
import type { ContributionRewardTier } from '../types';

interface GivebackContribution {
  // Points the visitor has unlocked. Points map 1:1 to currency, so this also
  // formats directly as the donation amount.
  earnedPoints: number;
  // The next reward above the visitor's points, or null once every tier is
  // unlocked.
  nextReward: ContributionRewardTier | null;
  pointsToNext: number;
  // Progress through the current segment (last unlocked tier -> next), 0-100.
  progressPercentage: number;
  // 1-based standing on the reward ladder: how many tiers the visitor has
  // unlocked, plus one. Level 1 before crossing the first tier.
  currentLevel: number;
  // Whether any reward tiers are configured, so the UI can stay silent about
  // "next reward" until they load (or when none exist).
  hasRewards: boolean;
  isPending: boolean;
}

// Single source of truth for "what have I unlocked, what's next" so the
// contribution summary and the floating bar can never disagree.
export const useGivebackContribution = (
  enabled: boolean,
): GivebackContribution => {
  const { status, isPending: isStatusPending } = useContributionStatus();
  const { rewardTiers, isPending: isRewardsPending } =
    useContributionRewards(enabled);

  const earnedPoints = status?.userPoints ?? 0;

  return useMemo(() => {
    const sorted = [...rewardTiers].sort(
      (a, b) => a.thresholdPoints - b.thresholdPoints,
    );
    const unlockedTiers = sorted.filter(
      (tier) => tier.thresholdPoints <= earnedPoints,
    );
    const nextReward =
      sorted.find((tier) => tier.thresholdPoints > earnedPoints) ?? null;
    const previousThreshold = unlockedTiers.reduce(
      (max, tier) => Math.max(max, tier.thresholdPoints),
      0,
    );

    const pointsToNext = nextReward
      ? Math.max(0, nextReward.thresholdPoints - earnedPoints)
      : 0;
    const segment = nextReward
      ? nextReward.thresholdPoints - previousThreshold
      : 0;
    const progressPercentage =
      nextReward && segment > 0
        ? Math.min(100, ((earnedPoints - previousThreshold) / segment) * 100)
        : 100;

    return {
      earnedPoints,
      nextReward,
      pointsToNext,
      progressPercentage,
      currentLevel: unlockedTiers.length + 1,
      hasRewards: sorted.length > 0,
      isPending: isStatusPending || isRewardsPending,
    };
  }, [earnedPoints, rewardTiers, isStatusPending, isRewardsPending]);
};
