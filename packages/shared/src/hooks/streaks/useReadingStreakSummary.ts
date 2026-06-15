import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from './useReadingStreak';
import { DEFAULT_TIMEZONE, isSameDayInTimezone } from '../../lib/timezones';
import { isWeekend } from '../../lib/date';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { ReadingDay, UserStreak } from '../../graphql/users';
import { getReadingStreak30Days } from '../../graphql/users';

const WEEK_LENGTH = 7;

export interface ReadingStreakSummary {
  isEnabled: boolean;
  streak?: UserStreak;
  count: number;
  hasReadToday: boolean;
  // A weekday where nothing has been read yet — the streak is on the line.
  isAtRisk: boolean;
  // 0..1 — share of the last 7 days that were read. Drives ring/line fills.
  weekProgress: number;
}

// Shared, deduped (single 30-day query keyed by user) streak summary so the
// various always-on streak surfaces render the same numbers.
export const useReadingStreakSummary = (): ReadingStreakSummary => {
  const { user } = useAuthContext();
  const { streak, isStreaksEnabled } = useReadingStreak();
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  const userId = user?.id;
  const isEnabled = !!user && isStreaksEnabled && !!streak;

  const { data: history } = useQuery<ReadingDay[]>({
    queryKey: generateQueryKey(RequestKey.ReadingStreak30Days, user),
    queryFn: () => getReadingStreak30Days(userId ?? ''),
    staleTime: StaleTime.Default,
    enabled: !!userId && isStreaksEnabled,
  });

  const hasReadToday =
    !!streak?.lastViewAt &&
    isSameDayInTimezone(new Date(streak.lastViewAt), new Date(), timezone);

  const weekProgress = useMemo(() => {
    const today = new Date();
    let read = 0;
    for (let index = 0; index < WEEK_LENGTH; index += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - index);
      const didRead = history?.some(
        ({ date: historyDate, reads }) =>
          reads > 0 &&
          isSameDayInTimezone(new Date(historyDate), date, timezone),
      );
      if (didRead) {
        read += 1;
      }
    }
    return read / WEEK_LENGTH;
  }, [history, timezone]);

  const isAtRisk =
    isEnabled &&
    !hasReadToday &&
    !isWeekend(new Date(), streak?.weekStart, timezone);

  return {
    isEnabled,
    streak,
    count: streak?.current ?? 0,
    hasReadToday,
    isAtRisk,
    weekProgress,
  };
};
