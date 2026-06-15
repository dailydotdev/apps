import { useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import SettingsContext from '../../contexts/SettingsContext';
import { useReadingStreak } from './useReadingStreak';
import { DEFAULT_TIMEZONE, isSameDayInTimezone } from '../../lib/timezones';
import { isWeekend } from '../../lib/date';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { ReadingDay, UserStreak } from '../../graphql/users';
import { getReadingStreak30Days } from '../../graphql/users';

const WEEK_LENGTH = 7;

export interface ReadingStreakSummary {
  // Whether the streak UI should be shown at all (logged in + not opted out).
  // Known synchronously from settings, so the rail can reserve the space before
  // the streak data has loaded.
  isEnabled: boolean;
  // The streak data is still being fetched — render a same-size skeleton.
  isLoading: boolean;
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
  const {
    streak,
    isStreaksEnabled,
    isLoading: isStreakLoading,
  } = useReadingStreak();
  const { loadedSettings, optOutReadingStreak } = useContext(SettingsContext);
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  const userId = user?.id;
  // Show the streak for logged-in users unless they've explicitly opted out.
  // Before settings load we optimistically reserve the space (assume on) so the
  // component never shifts in once the data arrives.
  const isEnabled = !!user && !(loadedSettings && optOutReadingStreak);
  // Data isn't ready until settings are loaded and the streak query resolves.
  const isLoading = isEnabled && (!loadedSettings || isStreakLoading);

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
    isLoading,
    streak,
    count: streak?.current ?? 0,
    hasReadToday,
    isAtRisk,
    weekProgress,
  };
};
