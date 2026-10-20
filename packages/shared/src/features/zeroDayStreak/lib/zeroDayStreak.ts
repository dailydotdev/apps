import type { QuestDashboard, UserQuest } from '../../../graphql/quests';
import { QuestRewardType, isQuestClaimed } from '../../../graphql/quests';
import { oneDay } from '../../../lib/dateFormat';

// The run is exactly one week. Past day seven the strip retires itself: someone
// who has claimed seven days running is no longer a zero-day user, and an
// endless strip is the chore this design exists to avoid.
export const ZERO_DAY_STREAK_LENGTH = 7;

// The day the briefing enters the picture — the first point in the run where
// the Cores claimed so far can buy something the user can't get by scrolling.
export const ZERO_DAY_BRIEF_UNLOCK_DAY = 3;

// How long an account counts as zero-day, and therefore how long it evaluates
// the flag at all.
export const ZERO_DAY_ENROLLMENT_DAYS = 14;

// What the run has unlocked of the briefing, and whether the Cores claimed so
// far actually cover one. Lives here rather than on the hook so the strip's
// presentational view doesn't have to import the hook to describe its props.
export type ZeroDayBrief = {
  isUnlocked: boolean;
  daysToUnlock: number;
  price: number;
  balance: number;
  canAfford: boolean;
};

export enum ZeroDayCellState {
  Claimed = 'claimed',
  Today = 'today',
  Upcoming = 'upcoming',
}

export const isZeroDayAccount = (
  createdAt?: string,
  now: Date = new Date(),
): boolean => {
  if (!createdAt) {
    return false;
  }

  const created = new Date(createdAt).getTime();

  if (Number.isNaN(created)) {
    return false;
  }

  const ageInDays = (now.getTime() - created) / (oneDay * 1000);

  return ageInDays >= 0 && ageInDays <= ZERO_DAY_ENROLLMENT_DAYS;
};

// Locked quests are Plus-only, so a free user can never claim them. They count
// toward the quest panel's denominator on purpose, but here they would make
// "claimed everything today" unreachable.
export const getDailyQuests = (dashboard?: QuestDashboard): UserQuest[] =>
  [
    ...(dashboard?.daily.regular ?? []),
    ...(dashboard?.daily.plus ?? []),
  ].filter((quest) => !quest.locked);

export const getClaimableDailyQuests = (
  dashboard?: QuestDashboard,
): UserQuest[] =>
  getDailyQuests(dashboard).filter(
    (quest) => quest.claimable && !!quest.userQuestId && !isQuestClaimed(quest),
  );

export const getCoresReward = (quests: UserQuest[]): number =>
  quests.reduce(
    (total, quest) =>
      total +
      quest.rewards
        .filter((reward) => reward.type === QuestRewardType.Cores)
        .reduce((sum, reward) => sum + reward.amount, 0),
    0,
  );

export const hasClaimedToday = (dashboard?: QuestDashboard): boolean => {
  const quests = getDailyQuests(dashboard);

  return quests.length > 0 && quests.every(isQuestClaimed);
};

// The dashboard carries a claim streak but no per-day history, so the week is
// derived rather than read: `currentStreak` counts the run including today once
// today is claimed, the same convention the reading streak counter uses.
export const getZeroDayWeek = ({
  currentStreak,
  claimedToday,
}: {
  currentStreak: number;
  claimedToday: boolean;
}): ZeroDayCellState[] => {
  const filled = Math.min(Math.max(currentStreak, 0), ZERO_DAY_STREAK_LENGTH);
  const todayIndex = claimedToday ? filled - 1 : filled;

  return Array.from({ length: ZERO_DAY_STREAK_LENGTH }, (_, index) => {
    if (index === todayIndex) {
      return ZeroDayCellState.Today;
    }

    return index < filled
      ? ZeroDayCellState.Claimed
      : ZeroDayCellState.Upcoming;
  });
};

// Which day of the run today is, 1-indexed — what the header counts off.
export const getZeroDayNumber = ({
  currentStreak,
  claimedToday,
}: {
  currentStreak: number;
  claimedToday: boolean;
}): number => {
  const filled = Math.min(Math.max(currentStreak, 0), ZERO_DAY_STREAK_LENGTH);

  return claimedToday
    ? Math.max(filled, 1)
    : Math.min(filled + 1, ZERO_DAY_STREAK_LENGTH);
};
