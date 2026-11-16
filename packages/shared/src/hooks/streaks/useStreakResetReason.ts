import { subDays } from 'date-fns';
import type { UserStreak } from '../../graphql/users';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureStreakWhyBroke } from '../../lib/featureManagement';
import { DEFAULT_TIMEZONE } from '../../lib/timezones';

export const STREAK_RESET_REASON_DAYS = 7;

// The API keeps lastReset after the streak restarts, so the client decides when
// the explanation still matters: only right after the break, before the user is
// back on a streak (current > 1) and within the week of the reset.
export const isStreakResetRelevant = (
  streak: Pick<UserStreak, 'current' | 'lastReset'> | undefined,
  now: Date = new Date(),
): boolean => {
  if (!streak?.lastReset?.missedDate || streak.current > 1) {
    return false;
  }

  const { lastReset } = streak;

  const at = new Date(lastReset.at);

  if (Number.isNaN(at.getTime())) {
    return false;
  }

  return at >= subDays(now, STREAK_RESET_REASON_DAYS);
};

interface StreakResetReason {
  isVisible: boolean;
  missedDate?: string;
  timezone: string;
  at?: string;
}

export const useStreakResetReason = (
  streak?: UserStreak,
): StreakResetReason => {
  const lastReset = streak?.lastReset;
  const isRelevant = isStreakResetRelevant(streak);
  const { value: isEnabled } = useConditionalFeature({
    feature: featureStreakWhyBroke,
    shouldEvaluate: isRelevant,
  });
  const isVisible = isRelevant && isEnabled;

  return {
    isVisible,
    missedDate: isVisible ? (lastReset?.missedDate ?? undefined) : undefined,
    timezone: lastReset?.timezone || DEFAULT_TIMEZONE,
    at: lastReset?.at,
  };
};
