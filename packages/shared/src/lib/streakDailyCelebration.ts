import { generateStorageKey, StorageTopic } from './storage';
import { storageWrapper } from './storageWrapper';
import { dateFormatInTimezone } from './timezones';

const STREAK_DAY_FORMAT = 'yyyy-MM-dd';

export const getStreakCelebratedKey = (userId: string): string =>
  generateStorageKey(StorageTopic.Streak, 'celebrated', userId);

const isPerfectSquare = (num: number): boolean => {
  const root = Math.floor(Math.sqrt(num));
  return root * root === num;
};

const isFibonacci = (num: number): boolean => {
  const square = 5 * num * num;
  return isPerfectSquare(square + 4) || isPerfectSquare(square - 4);
};

// Mirrors the API's milestone rule (workers/newView.ts), which raises
// alerts.showStreakMilestone for the milestone modal on these days.
export const isStreakMilestone = (current: number): boolean =>
  current > 1 && isFibonacci(current);

export const hasCelebratedStreakToday = (
  userId: string,
  timezone?: string,
): boolean => {
  try {
    return (
      storageWrapper.getItem(getStreakCelebratedKey(userId)) ===
      dateFormatInTimezone(new Date(), STREAK_DAY_FORMAT, timezone)
    );
  } catch {
    return false;
  }
};

export const markStreakCelebrated = (
  userId: string,
  timezone?: string,
): void => {
  try {
    storageWrapper.setItem(
      getStreakCelebratedKey(userId),
      dateFormatInTimezone(new Date(), STREAK_DAY_FORMAT, timezone),
    );
  } catch {
    // ignore storage quota / privacy-mode failures
  }
};
