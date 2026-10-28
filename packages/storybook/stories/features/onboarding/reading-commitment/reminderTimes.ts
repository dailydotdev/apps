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

const isTwelveHour = (): boolean =>
  !!new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions()
    .hour12;

/**
 * A stored time in the device's own clock format, so the copy matches the
 * lock screen it describes: "5:00 PM" in the US, "17:00" in most of Europe.
 */
export const displayTime = (value: string): string => {
  const hour = hourOfTime(value);
  return isTwelveHour()
    ? timeOfHour(hour)
    : `${String(hour).padStart(2, '0')}:00`;
};

/** The lock screen's clock: the display time without its AM/PM. */
export const clockOfTime = (value: string): string =>
  displayTime(value).replace(/\s?[AP]M$/, '');

/**
 * The first reminder lands today when its hour is still ahead, else
 * tomorrow. Assumes the backend sends it the same day when it can.
 */
export const isFirstReminderToday = (
  value: string,
  now = new Date(),
): boolean => hourOfTime(value) > now.getHours();
