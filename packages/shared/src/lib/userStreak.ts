import type { UserStreak } from '../graphql/users';
import { isSameDayInTimezone } from './timezones';

// The API credits a view asynchronously (viewPost only publishes it, and the
// newView worker writes the streak), so a userStreak read right after the
// mutation can still be the pre-view streak. It includes today's read only
// once its lastViewAt falls on today in the profile timezone.
export const hasStreakViewToday = (
  streak: Pick<UserStreak, 'lastViewAt'> | undefined | null,
  timezone?: string,
  now: Date = new Date(),
): boolean =>
  !!streak?.lastViewAt &&
  isSameDayInTimezone(new Date(streak.lastViewAt), now, timezone);

// Whether a refetched streak already includes the read we just sent. Besides
// a lastViewAt today, a count that already matches the one we expect counts
// too: when the API's grace window credits an early-morning read to
// yesterday, lastViewAt lands on yesterday and never looks like today.
export const includesThisRead = (
  streak: Pick<UserStreak, 'lastViewAt' | 'current'> | undefined | null,
  timezone?: string,
  expectedCurrent?: number,
  now: Date = new Date(),
): boolean =>
  hasStreakViewToday(streak, timezone, now) ||
  (expectedCurrent !== undefined && streak?.current === expectedCurrent);
