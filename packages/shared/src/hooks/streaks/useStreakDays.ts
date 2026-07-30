import { addDays, subDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Streak } from '../../components/streak/popup/DayStreak';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { ReadingDay } from '../../graphql/users';
import { getReadingStreak30Days } from '../../graphql/users';
import { userStreakFreezeDatesQueryOptions } from '../../graphql/streakFreeze';
import { useHasAccessToCores } from '../useCoresFeature';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureStreakFreeze } from '../../lib/featureManagement';
import { DayOfWeek, isWeekend } from '../../lib/date';
import { isSameDayInTimezone } from '../../lib/timezones';

// Classify a single day against the user's reading history. Extracted from
// ReadingStreakPopup so the popup, the compact sidebar calendar and the rail
// all share one implementation.
export const getStreak = ({
  value,
  today,
  history,
  startOfWeek = DayOfWeek.Monday,
  timezone,
  freezeDates,
}: {
  value: Date;
  today: Date;
  history?: ReadingDay[];
  startOfWeek?: number;
  timezone?: string;
  freezeDates?: string[];
}): Streak => {
  const isFreezeDay = isWeekend(value, startOfWeek, timezone);
  const isUsedFreezeDay = freezeDates?.some((freezeDate) =>
    isSameDayInTimezone(new Date(freezeDate), value, timezone),
  );
  const isToday = isSameDayInTimezone(value, today, timezone);
  const isFuture = value > today;
  const isCompleted =
    !isFuture &&
    history?.some(({ date: historyDate, reads }) => {
      const dateToCompare = new Date(historyDate);
      const sameDate = isSameDayInTimezone(dateToCompare, value, timezone);

      return sameDate && reads > 0;
    });

  if (isCompleted) {
    return Streak.Completed;
  }

  // Consumed freezes are their own auto-applied purchase, distinct from the
  // always-on weekend rest day below (different tooltip copy).
  if (isUsedFreezeDay) {
    return Streak.UsedFreeze;
  }

  if (isFreezeDay) {
    return Streak.Freeze;
  }

  if (isToday) {
    return Streak.Pending;
  }

  return Streak.Upcoming;
};

// The 4-days-before → today → 4-days-after window the popup calendar shows.
export const getStreakDays = (today: Date): Date[] => [
  subDays(today, 4),
  subDays(today, 3),
  subDays(today, 2),
  subDays(today, 1),
  today,
  addDays(today, 1),
  addDays(today, 2),
  addDays(today, 3),
  addDays(today, 4),
];

// The user's last-30-days reading history (one shared cache key, so callers
// never trigger a duplicate request).
export const useReadingStreak30Days = (): ReadingDay[] | undefined => {
  const { user } = useAuthContext();
  const userId = user?.id;
  return useQuery<ReadingDay[]>({
    queryKey: generateQueryKey(RequestKey.ReadingStreak30Days, user),
    queryFn: () => getReadingStreak30Days(userId ?? ''),
    staleTime: StaleTime.Default,
    enabled: !!userId,
  }).data;
};

// The days a purchased streak freeze was auto-applied, gated on Cores access +
// the streak_freeze feature (undefined while gated/loading). Shared by the
// streak popup and the v2 sidebar calendar so both mark used-freeze days the
// same way without duplicating the gating.
export const useStreakFreezeDates = (): string[] | undefined => {
  const { user } = useAuthContext();
  const hasAccessToCores = useHasAccessToCores();
  const { value: isStreakFreezeEnabled } = useConditionalFeature({
    feature: featureStreakFreeze,
    shouldEvaluate: hasAccessToCores,
  });
  return useQuery({
    ...userStreakFreezeDatesQueryOptions({ user }),
    enabled: !!user?.id && hasAccessToCores && isStreakFreezeEnabled,
  }).data;
};
