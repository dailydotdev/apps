import { utcToZonedTime } from 'date-fns-tz';
import { isNullOrUndefined } from './func';
import { DEFAULT_TIMEZONE } from './timezones';

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export const DEFAULT_WEEK_START = DayOfWeek.Monday;

export const isWeekend = (
  date: Date,
  startOfWeek: DayOfWeek = DEFAULT_WEEK_START,
  timezone?: string,
): boolean => {
  const day = utcToZonedTime(date, timezone || DEFAULT_TIMEZONE).getDay();
  switch (startOfWeek) {
    case DayOfWeek.Sunday:
      return day === DayOfWeek.Friday || day === DayOfWeek.Saturday;
    case DayOfWeek.Monday:
    default:
      return day === DayOfWeek.Saturday || day === DayOfWeek.Sunday;
  }
};

export const getDefaultStartOfWeek = (weekStart?: number): string => {
  if (isNullOrUndefined(weekStart)) {
    return DEFAULT_WEEK_START.toString();
  }

  return (weekStart as number).toString();
};
