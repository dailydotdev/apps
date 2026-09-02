import { useContext } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import SettingsContext from '../../contexts/SettingsContext';
import { useReadingStreak } from './useReadingStreak';
import { DEFAULT_TIMEZONE, isSameDayInTimezone } from '../../lib/timezones';
import { isWeekend } from '../../lib/date';
import type { UserStreak } from '../../graphql/users';

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
}

// Shared streak summary (from the single deduped streak query) so the various
// always-on streak surfaces render the same numbers.
export const useReadingStreakSummary = (): ReadingStreakSummary => {
  const { user } = useAuthContext();
  const { streak, isLoading: isStreakLoading } = useReadingStreak();
  const { loadedSettings, optOutReadingStreak } = useContext(SettingsContext);
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  // Show the streak for logged-in users unless they've explicitly opted out.
  // Before settings load we optimistically reserve the space (assume on) so the
  // component never shifts in once the data arrives.
  const isEnabled = !!user && !(loadedSettings && optOutReadingStreak);
  // Data isn't ready until settings are loaded and the streak query resolves.
  const isLoading = isEnabled && (!loadedSettings || isStreakLoading);

  const hasReadToday =
    !!streak?.lastViewAt &&
    isSameDayInTimezone(new Date(streak.lastViewAt), new Date(), timezone);

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
  };
};
