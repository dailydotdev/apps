import { formatHour } from '../FeedPatchy/ReminderPicker';

/** Whether this device's clock reads "5:00 PM" rather than "17:00". */
export const isTwelveHourClock = (): boolean =>
  new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions()
    .hour12 ?? false;

/** A device clock for the hour, with its AM/PM apart so it can sit smaller. */
export const clockOfHour = (
  hour: number,
  isTwelveHour: boolean,
): { clock: string; period?: string } => {
  const [clock, period] = formatHour(hour, isTwelveHour).split(' ');
  return { clock, period };
};
