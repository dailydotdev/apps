import { subDays } from 'date-fns';
import { isStreakResetRelevant } from './useStreakResetReason';
import type { UserStreak, UserStreakReset } from '../../graphql/users';

const now = new Date('2026-11-12T10:00:00.000Z');

const streak = (
  current: number,
  lastReset: UserStreak['lastReset'],
): Pick<UserStreak, 'current' | 'lastReset'> => ({ current, lastReset });

const reset = (at: Date): UserStreakReset => ({
  missedDate: '2026-11-09',
  timezone: 'Europe/Amsterdam',
  at: at.toISOString(),
});

describe('isStreakResetRelevant', () => {
  it('shows a reset from 2 days ago while the streak is still 0', () => {
    expect(isStreakResetRelevant(streak(0, reset(subDays(now, 2))), now)).toBe(
      true,
    );
  });

  it('keeps showing it on the first day back (current 1)', () => {
    expect(isStreakResetRelevant(streak(1, reset(subDays(now, 2))), now)).toBe(
      true,
    );
  });

  it('hides it once the user is back on a streak', () => {
    expect(isStreakResetRelevant(streak(2, reset(subDays(now, 2))), now)).toBe(
      false,
    );
  });

  it('hides a reset older than 7 days', () => {
    expect(isStreakResetRelevant(streak(0, reset(subDays(now, 9))), now)).toBe(
      false,
    );
  });

  it('hides it when the streak was never reset', () => {
    expect(isStreakResetRelevant(streak(0, null), now)).toBe(false);
    expect(isStreakResetRelevant(streak(0, undefined), now)).toBe(false);
    expect(isStreakResetRelevant(undefined, now)).toBe(false);
  });

  it('hides it when the API could not pin down the missed day', () => {
    expect(
      isStreakResetRelevant(
        streak(0, { ...reset(subDays(now, 2)), missedDate: null }),
        now,
      ),
    ).toBe(false);
  });
});
