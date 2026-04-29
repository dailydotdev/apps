import type {
  FocusSchedule,
  FocusScheduleWeekday,
  FocusScheduleWindow,
} from '../../../graphql/settings';

export const WEEKDAYS: readonly FocusScheduleWeekday[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const;

const MINUTES_PER_DAY = 24 * 60;

// JS Date.getDay() returns 0 for Sunday — map it onto our Mon-first list.
const dayIndexToWeekday = (jsDay: number): FocusScheduleWeekday => {
  const monFirst = (jsDay + 6) % 7;
  return WEEKDAYS[monFirst];
};

const getPreviousWeekday = (
  weekday: FocusScheduleWeekday,
): FocusScheduleWeekday => {
  const weekdayIndex = WEEKDAYS.indexOf(weekday);
  return WEEKDAYS[(weekdayIndex + WEEKDAYS.length - 1) % WEEKDAYS.length];
};

export const defaultFocusSchedule = (): FocusSchedule => ({
  pauseUntil: null,
  windows: WEEKDAYS.reduce<
    Partial<Record<FocusScheduleWeekday, FocusScheduleWindow>>
  >(
    (acc, day) => ({
      ...acc,
      [day]: { start: 9 * 60, end: 17 * 60, enabled: false },
    }),
    {},
  ),
});

export const minutesSinceMidnight = (date: Date): number =>
  date.getHours() * 60 + date.getMinutes();

const clampMinutes = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > MINUTES_PER_DAY) {
    return MINUTES_PER_DAY;
  }
  return Math.floor(value);
};

const isWindowActiveAt = (
  window: FocusScheduleWindow | null | undefined,
  minutes: number,
): boolean => {
  if (!window || !window.enabled) {
    return false;
  }
  const start = clampMinutes(window.start);
  const end = clampMinutes(window.end);
  if (start === end) {
    return false;
  }
  // Handle overnight windows (e.g. 22:00 → 06:00) by splitting at midnight.
  if (start < end) {
    return minutes >= start && minutes < end;
  }
  return minutes >= start || minutes < end;
};

const isOvernightCarryoverActiveAt = (
  window: FocusScheduleWindow | null | undefined,
  minutes: number,
): boolean => {
  if (!window || !window.enabled) {
    return false;
  }
  const start = clampMinutes(window.start);
  const end = clampMinutes(window.end);
  return start > end && minutes < end;
};

export const isInsideAnyWindow = (
  schedule: FocusSchedule | null | undefined,
  date: Date,
): boolean => {
  if (!schedule?.windows) {
    return false;
  }
  const today = dayIndexToWeekday(date.getDay());
  const minutes = minutesSinceMidnight(date);
  if (isWindowActiveAt(schedule.windows[today], minutes)) {
    return true;
  }
  const previousDay = getPreviousWeekday(today);
  return isOvernightCarryoverActiveAt(schedule.windows[previousDay], minutes);
};

export const isPauseActive = (
  schedule: FocusSchedule | null | undefined,
  date: Date,
): boolean => {
  if (!schedule?.pauseUntil) {
    return false;
  }
  return schedule.pauseUntil > date.getTime();
};

export const isFocusActiveAt = (
  schedule: FocusSchedule | null | undefined,
  date: Date,
): boolean => isInsideAnyWindow(schedule, date);
