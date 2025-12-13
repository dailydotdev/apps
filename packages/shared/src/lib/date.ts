import { utcToZonedTime } from 'date-fns-tz';
import { isNullOrUndefined } from './func';
import { DEFAULT_TIMEZONE } from './timezones';
import { getTodayTz } from './dateFormat';

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

export const isOlderThan = (seconds: number, date: Date) => {
  const currentDate = getTodayTz('UTC', new Date());
  return date.getTime() < currentDate.getTime() - seconds;
};

export interface DateRange {
  start: Date;
  end: Date;
}

export function mergeOverlappingRanges(ranges: DateRange[]): DateRange[] {
  if (ranges.length === 0) {
    return [];
  }

  const sorted = [...ranges].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );

  const merged: DateRange[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const lastMerged = merged[merged.length - 1];

    if (current.start.getTime() <= lastMerged.end.getTime()) {
      lastMerged.end = new Date(
        Math.max(lastMerged.end.getTime(), current.end.getTime()),
      );
    } else {
      merged.push(current);
    }
  }

  return merged;
}

export function calculateTotalDurationInMonths(ranges: DateRange[]): {
  years: number;
  months: number;
  totalMonths: number;
} {
  const mergedRanges = mergeOverlappingRanges(ranges);

  const totalMs = mergedRanges.reduce(
    (sum, range) => sum + (range.end.getTime() - range.start.getTime()),
    0,
  );

  const totalMonths = Math.floor(totalMs / (30 * 24 * 60 * 60 * 1000));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return { years, months, totalMonths };
}
