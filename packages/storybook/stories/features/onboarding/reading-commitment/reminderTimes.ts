import type { PushContent } from './NotificationPreview';

export interface ReminderTime {
  /** The time as the OS prints it, also the answer's value. */
  value: string;
  /** The answer on the "When do you usually have a few minutes?" screen. */
  label: string;
  /** The push sent at this time, worded for the moment it lands in. */
  push: (goal: number) => Omit<PushContent, 'when'>;
}

export const REMINDER_TIMES: ReminderTime[] = [
  {
    value: '9:00 AM',
    label: 'With my morning coffee',
    push: (goal) => ({
      title: 'Coffee and code ☕',
      body: `Start the day with ${goal} minutes of fresh posts on React and AI.`,
    }),
  },
  {
    value: '12:30 PM',
    label: 'On my lunch break',
    push: (goal) => ({
      title: 'Lunch break read 🥪',
      body: `${goal} minutes of the best dev news while you eat.`,
    }),
  },
  {
    value: '6:00 PM',
    label: 'After work',
    push: (goal) => ({
      title: 'Evening catch-up 🌆',
      body: `Catch up on what you missed today in ${goal} minutes.`,
    }),
  },
  {
    value: '10:00 PM',
    label: 'Before bed',
    push: (goal) => ({
      title: 'Bedtime read 🌙',
      body: `${goal} minutes before bed. Your top picks are waiting.`,
    }),
  },
];

export const DEFAULT_REMINDER_TIME = REMINDER_TIMES[0];

/** "9:00 AM" → 9, "6:00 PM" → 18. */
export const hourOfTime = (value: string): number => {
  const [, hours, half] = value.match(/^(\d+):\d+\s?([AP]M)$/) ?? [];
  return (Number(hours) % 12) + (half === 'PM' ? 12 : 0);
};

/** A whole hour, as the OS prints it: 9 → "9:00 AM", 17 → "5:00 PM". */
export const timeOfHour = (hour: number): string =>
  `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;

// The ruler picks any hour; each falls into the moment whose push it gets.
const slotOfHour = (hour: number): ReminderTime => {
  if (hour >= 5 && hour < 11) {
    return REMINDER_TIMES[0];
  }
  if (hour >= 11 && hour < 15) {
    return REMINDER_TIMES[1];
  }
  if (hour >= 15 && hour < 21) {
    return REMINDER_TIMES[2];
  }
  return REMINDER_TIMES[3];
};

export const reminderTimeOf = (value?: string): ReminderTime =>
  REMINDER_TIMES.find((time) => time.value === value) ??
  (value ? slotOfHour(hourOfTime(value)) : DEFAULT_REMINDER_TIME);
