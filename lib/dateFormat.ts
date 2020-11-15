import { isSameDay, subDays } from 'date-fns';

const oneMinute = 60;
const oneHour = 3600;
const oneDay = 86400;
const oneYear = oneDay * 365;

export function postDateFormat(
  value: Date | number | string,
  now = new Date(),
): string {
  const date = new Date(value);

  // Calculate time delta in seconds.
  const dt = (now.getTime() - date.getTime()) / 1000;

  if (dt <= oneMinute) return 'Now';

  if (isSameDay(date, now)) {
    return 'Today';
  }

  if (isSameDay(date, subDays(now, 1))) return 'Yesterday';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export function commentDateFormat(
  value: Date | number | string,
  now = new Date(),
): string {
  const date = new Date(value);

  const dt = (now.getTime() - date.getTime()) / 1000;

  if (dt <= oneMinute) return 'Now';

  if (dt <= oneHour) {
    const numMinutes = Math.round(dt / oneMinute);
    return `${numMinutes} ${numMinutes === 1 ? 'min' : 'mins'}`;
  }

  if (dt <= oneDay) {
    const numHours = Math.round(dt / oneHour);
    return `${numHours} ${numHours === 1 ? 'hr' : 'hrs'}`;
  }

  if (dt <= oneYear) {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
    });
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}
