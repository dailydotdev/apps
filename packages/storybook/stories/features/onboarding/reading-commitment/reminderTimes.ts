import { formatHour } from '@dailydotdev/shared/src/components/onboarding/FeedPatchy/ReminderPicker';
import type { PushContent } from './NotificationPreview';

export interface ReminderTime {
  /** A sample time in the moment, as "9:00 AM"; also the story's value. */
  value: string;
  /** The moment, as the previews story names it. */
  label: string;
  /** The push sent at this time, worded for the moment it lands in. */
  push: (goal: number) => Omit<PushContent, 'when'>;
}

export const REMINDER_TIMES: ReminderTime[] = [
  {
    value: '9:00 AM',
    label: 'Morning, 5 AM to 11 AM',
    push: (goal) => ({
      title: 'Coffee and code ☕',
      body: `Start the day with ${goal} minutes of fresh posts on React and AI.`,
    }),
  },
  {
    value: '12:00 PM',
    label: 'Lunch, 11 AM to 2 PM',
    push: (goal) => ({
      title: 'Lunch break read 🥪',
      body: `${goal} minutes of the best dev news while you eat.`,
    }),
  },
  {
    value: '3:00 PM',
    label: 'Afternoon, 2 PM to 5 PM',
    push: (goal) => ({
      title: 'Afternoon read 📚',
      body: `Take a ${goal}-minute break with the best of your feed.`,
    }),
  },
  {
    value: '6:00 PM',
    label: 'Evening, 5 PM to 9 PM',
    push: (goal) => ({
      title: 'Evening catch-up 🌆',
      body: `Catch up on what you missed today in ${goal} minutes.`,
    }),
  },
  {
    value: '10:00 PM',
    label: 'Night, 9 PM to 5 AM',
    push: (goal) => ({
      title: 'Your night read 🌙',
      body: `${goal} minutes of your top picks to end the day.`,
    }),
  },
];

export const DEFAULT_REMINDER_TIME = REMINDER_TIMES[0];

/** "9:00 AM" → 9, "6:00 PM" → 18. */
export const hourOfTime = (value: string): number => {
  const [, hours, half] = value.match(/^(\d+):\d+\s?([AP]M)$/) ?? [];
  return (Number(hours) % 12) + (half === 'PM' ? 12 : 0);
};

/** A whole hour as the flow stores it: 9 → "9:00 AM", 17 → "5:00 PM". */
export const timeOfHour = (hour: number): string =>
  `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;

// The ruler picks any hour; each falls into the moment whose push it gets.
const slotOfHour = (hour: number): ReminderTime => {
  if (hour >= 5 && hour < 11) {
    return REMINDER_TIMES[0];
  }
  if (hour >= 11 && hour < 14) {
    return REMINDER_TIMES[1];
  }
  if (hour >= 14 && hour < 17) {
    return REMINDER_TIMES[2];
  }
  if (hour >= 17 && hour < 21) {
    return REMINDER_TIMES[3];
  }
  return REMINDER_TIMES[4];
};

export const reminderTimeOf = (value?: string): ReminderTime =>
  value ? slotOfHour(hourOfTime(value)) : DEFAULT_REMINDER_TIME;

export type ClockFormat = 'auto' | '12h' | '24h';

// Where clocks read "5:00 PM": the US, Canada, Australia, New Zealand,
// India, Pakistan and the Philippines. Everywhere else reads "17:00".
const TWELVE_HOUR_ZONE_PREFIXES = [
  'US/',
  'Canada/',
  'Australia/',
  'America/Indiana/',
  'America/Kentucky/',
  'America/North_Dakota/',
];

const TWELVE_HOUR_ZONES = new Set([
  'America/New_York',
  'America/Detroit',
  'America/Chicago',
  'America/Menominee',
  'America/Denver',
  'America/Boise',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Juneau',
  'America/Sitka',
  'America/Metlakatla',
  'America/Yakutat',
  'America/Nome',
  'America/Adak',
  'Pacific/Honolulu',
  'America/St_Johns',
  'America/Halifax',
  'America/Glace_Bay',
  'America/Moncton',
  'America/Goose_Bay',
  'America/Toronto',
  'America/Winnipeg',
  'America/Regina',
  'America/Swift_Current',
  'America/Edmonton',
  'America/Vancouver',
  'America/Whitehorse',
  'America/Dawson',
  'America/Yellowknife',
  'America/Iqaluit',
  'Pacific/Auckland',
  'Pacific/Chatham',
  'Asia/Kolkata',
  'Asia/Calcutta',
  'Asia/Karachi',
  'Asia/Manila',
]);

const isTwelveHourZone = (timezone: string): boolean =>
  TWELVE_HOUR_ZONES.has(timezone) ||
  TWELVE_HOUR_ZONE_PREFIXES.some((prefix) => timezone.startsWith(prefix));

/** Whether the reader's region reads the clock as "5:00 PM". */
export const usesTwelveHourClock = (
  format: ClockFormat,
  timezone: string,
): boolean =>
  format === 'auto' ? isTwelveHourZone(timezone) : format === '12h';

/** A stored time in the region's format: "5:00 PM" or "17:00". */
export const displayTime = (value: string, isTwelveHour: boolean): string =>
  formatHour(hourOfTime(value), isTwelveHour);

/** The lock screen's clock, with its AM/PM apart so it can sit smaller. */
export const clockOfTime = (
  value: string,
  isTwelveHour: boolean,
): { clock: string; period?: string } => {
  const [clock, period] = displayTime(value, isTwelveHour).split(' ');
  return { clock, period };
};

/**
 * The first reminder lands today when its hour is still ahead, else
 * tomorrow. Assumes the backend sends it the same day when it can.
 */
export const isFirstReminderToday = (
  value: string,
  now = new Date(),
): boolean => hourOfTime(value) > now.getHours();
