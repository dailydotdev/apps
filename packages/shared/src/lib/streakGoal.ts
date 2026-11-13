import type { StreakGoal } from '../graphql/settings';
import { STREAK_GOAL_OPTIONS } from '../graphql/settings';
import type { UserStreak } from '../graphql/users';
import { generateStorageKey, StorageTopic } from './storage';
import { storageWrapper } from './storageWrapper';
import { dateFormatInTimezone } from './timezones';

const STREAK_DAY_FORMAT = 'yyyy-MM-dd';

export const isStreakGoal = (value: unknown): value is StreakGoal =>
  (STREAK_GOAL_OPTIONS as readonly unknown[]).includes(value);

// The goal offered after hitting one: 7 -> 14 -> 30, then no next goal.
export const getNextStreakGoal = (goal: StreakGoal): StreakGoal | null => {
  const index = STREAK_GOAL_OPTIONS.indexOf(goal);

  return STREAK_GOAL_OPTIONS[index + 1] ?? null;
};

export interface StreakGoalProgress {
  current: number;
  goal: StreakGoal;
  // 0..1, how far the current streak is towards the goal
  ratio: number;
}

// Progress is only shown on the way to the goal: nothing at 0 (nothing to
// count yet) and nothing once it is reached (the celebration takes over).
export const getStreakGoalProgress = (
  current: number | undefined,
  goal: StreakGoal | null | undefined,
): StreakGoalProgress | null => {
  if (!goal || !isStreakGoal(goal) || !current || current >= goal) {
    return null;
  }

  return { current, goal, ratio: current / goal };
};

export const getStreakGoalCopy = ({
  current,
  goal,
}: Pick<StreakGoalProgress, 'current' | 'goal'>): string =>
  `${current}/${goal} to your goal`;

export const getStreakGoalReachedCopy = (goal: StreakGoal): string =>
  `Goal reached: ${goal} days!`;

export enum StreakGoalPromptReason {
  // Second day of a streak, no goal yet
  DayTwo = 'day_2',
  // The streak reset, offer a fresh goal
  Break = 'break',
  // Picking the next goal from the goal reached toast
  NextGoal = 'next_goal',
}

export const getStreakGoalBreakPromptKey = (userId: string): string =>
  generateStorageKey(StorageTopic.Streak, 'goal_break_prompt', userId);

export const getStreakGoalHitKey = (userId: string): string =>
  generateStorageKey(StorageTopic.Streak, 'goal_hit', userId);

// One break prompt per reset: keyed on when the API says the streak reset, or
// on the local day when it did not say.
export const getStreakBreakKey = (
  streak: Pick<UserStreak, 'lastReset'>,
  timezone?: string,
): string =>
  streak.lastReset?.at ??
  dateFormatInTimezone(new Date(), STREAK_DAY_FORMAT, timezone);

const readStorage = (key: string): string | null => {
  try {
    return storageWrapper.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string): void => {
  try {
    storageWrapper.setItem(key, value);
  } catch {
    // ignore storage quota / privacy-mode failures
  }
};

export const hasSeenStreakGoalBreakPrompt = (
  userId: string,
  breakKey: string,
): boolean => readStorage(getStreakGoalBreakPromptKey(userId)) === breakKey;

export const markStreakGoalBreakPromptSeen = (
  userId: string,
  breakKey: string,
): void => writeStorage(getStreakGoalBreakPromptKey(userId), breakKey);

// Guards against a second celebration of the same goal on the same day (a
// replayed view or a second tab).
const getStreakGoalHitValue = (goal: StreakGoal, timezone?: string): string =>
  `${goal}:${dateFormatInTimezone(new Date(), STREAK_DAY_FORMAT, timezone)}`;

export const hasCelebratedStreakGoalToday = (
  userId: string,
  goal: StreakGoal,
  timezone?: string,
): boolean =>
  readStorage(getStreakGoalHitKey(userId)) ===
  getStreakGoalHitValue(goal, timezone);

export const markStreakGoalCelebrated = (
  userId: string,
  goal: StreakGoal,
  timezone?: string,
): void =>
  writeStorage(getStreakGoalHitKey(userId), getStreakGoalHitValue(goal, timezone));
