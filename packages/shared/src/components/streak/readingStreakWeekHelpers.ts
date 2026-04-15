import { addDays, subDays } from 'date-fns';
import type { ReadingDay } from '../../graphql/users';
import { isWeekend, DayOfWeek } from '../../lib/date';
import { isSameDayInTimezone } from '../../lib/timezones';
import { Streak } from './popup/DayStreak';

export const getStreak = ({
  value,
  today,
  history,
  startOfWeek = DayOfWeek.Monday,
  timezone,
}: {
  value: Date;
  today: Date;
  history?: ReadingDay[];
  startOfWeek?: number;
  timezone?: string;
}): Streak => {
  const isFreezeDay = isWeekend(value, startOfWeek, timezone);
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

  if (isFreezeDay) {
    return Streak.Freeze;
  }

  if (isToday) {
    return Streak.Pending;
  }

  return Streak.Upcoming;
};

export const getStreakDays = (today: Date): Date[] => {
  return [
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
};

/** Last seven calendar days ending on `today` (for compact strips). */
export const getLastSevenDays = (today: Date): Date[] => {
  return Array.from({ length: 7 }, (_, index) => subDays(today, 6 - index));
};
