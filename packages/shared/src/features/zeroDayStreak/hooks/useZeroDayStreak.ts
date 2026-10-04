import { useCallback, useMemo } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useQuestDashboard } from '../../../hooks/useQuestDashboard';
import { useClaimQuestReward } from '../../../hooks/useClaimQuestReward';
import { useFeature } from '../../../components/GrowthBookProvider';
import {
  briefGeneratePricing,
  featureZeroDayStreak,
} from '../../../lib/featureManagement';
import { BriefingType } from '../../../graphql/posts';
import type { UserQuest } from '../../../graphql/quests';
import type { ZeroDayBrief, ZeroDayCellState } from '../lib/zeroDayStreak';
import {
  ZERO_DAY_BRIEF_UNLOCK_DAY,
  ZERO_DAY_STREAK_LENGTH,
  getClaimableDailyQuests,
  getCoresReward,
  getZeroDayNumber,
  getZeroDayWeek,
  hasClaimedToday,
  isZeroDayAccount,
} from '../lib/zeroDayStreak';

export type UseZeroDayStreak = {
  isEnrolled: boolean;
  week: ZeroDayCellState[];
  day: number;
  claimStreak: number;
  claimableQuests: UserQuest[];
  claimedToday: boolean;
  isClaiming: boolean;
  /** Resolves to the Cores the claim paid out, for the reveal. */
  claimToday: () => Promise<number>;
  brief: ZeroDayBrief;
};

export const useZeroDayStreak = (): UseZeroDayStreak => {
  const { user, isLoggedIn } = useAuthContext();
  const isZeroDay = isLoggedIn && isZeroDayAccount(user?.createdAt);
  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: featureZeroDayStreak,
    shouldEvaluate: isZeroDay,
  });
  const { data } = useQuestDashboard({ enabled: isFeatureEnabled });
  const pricing = useFeature(briefGeneratePricing);
  const { mutateAsync: claim, isPending: isClaiming } = useClaimQuestReward();

  const claimStreak = data?.currentStreak ?? 0;
  const claimedToday = hasClaimedToday(data);
  const claimableQuests = useMemo(() => getClaimableDailyQuests(data), [data]);
  const week = useMemo(
    () => getZeroDayWeek({ currentStreak: claimStreak, claimedToday }),
    [claimStreak, claimedToday],
  );

  const claimToday = useCallback(async () => {
    if (!claimableQuests.length) {
      return 0;
    }

    // Claimed one at a time: every claim returns a whole fresh dashboard that
    // the mutation writes into the cache, so firing them together would let the
    // last response overwrite the others' progress.
    await claimableQuests.reduce(
      (previous, quest) =>
        previous.then(async () => {
          await claim({
            userQuestId: quest.userQuestId as string,
            questId: quest.quest.id,
            questType: quest.quest.type,
          });
        }),
      Promise.resolve(),
    );

    return getCoresReward(claimableQuests);
  }, [claimableQuests, claim]);

  const price =
    pricing?.[BriefingType.Daily] ??
    briefGeneratePricing.defaultValue[BriefingType.Daily];
  const balance = user?.balance?.amount ?? 0;
  const brief: ZeroDayBrief = {
    isUnlocked: claimStreak >= ZERO_DAY_BRIEF_UNLOCK_DAY,
    daysToUnlock: Math.max(ZERO_DAY_BRIEF_UNLOCK_DAY - claimStreak, 0),
    price,
    balance,
    canAfford: balance >= price,
  };

  return {
    // The dashboard has to have loaded for the week to mean anything, and the
    // strip retires once the run is past a full week.
    isEnrolled:
      isFeatureEnabled &&
      isZeroDay &&
      !!data &&
      claimStreak <= ZERO_DAY_STREAK_LENGTH,
    week,
    day: getZeroDayNumber({ currentStreak: claimStreak, claimedToday }),
    claimStreak,
    claimableQuests,
    claimedToday,
    isClaiming,
    claimToday,
    brief,
  };
};
