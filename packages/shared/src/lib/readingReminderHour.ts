import { getHourTimezone } from './timezones';

export const DEFAULT_READING_REMINDER_HOUR = 9;
const LATE_NIGHT_END_HOUR = 5;
const READING_REMINDER_PRESET_HOURS = [9, 13, 20];

/** The hour now in `timeZone`, 0–23. */
export const getCurrentHour = (timeZone: string): number =>
  getHourTimezone(timeZone) % 24;

/** The current hour, except late at night, where 9 AM is offered instead. */
export const getOfferedReminderHour = (currentHour: number): number =>
  currentHour < LATE_NIGHT_END_HOUR
    ? DEFAULT_READING_REMINDER_HOUR
    : currentHour;

/** The presets, with the offered hour in place of the nearest one. */
export const getReminderHourChoices = (currentHour: number): number[] => {
  const offered = getOfferedReminderHour(currentHour);
  if (READING_REMINDER_PRESET_HOURS.includes(offered)) {
    return READING_REMINDER_PRESET_HOURS;
  }

  const nearest = READING_REMINDER_PRESET_HOURS.reduce((best, hour) =>
    Math.abs(hour - offered) < Math.abs(best - offered) ? hour : best,
  );

  return READING_REMINDER_PRESET_HOURS.map((hour) =>
    hour === nearest ? offered : hour,
  ).sort((a, b) => a - b);
};

/** 20 → "8 PM", 9 → "9 AM". */
export const formatReminderHour = (hour: number): string =>
  `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`;
