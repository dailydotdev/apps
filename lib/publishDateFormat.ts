// Time spans in milliseconds, used for comparing dates. Month and year variable, thus omitted.
const oneMinute = 60000;
const oneDay = 86400000;

const isYesterday = (date: Date, now = new Date()): boolean => {
  const dateMs = date.getTime();
  const dateDayMs = dateMs - (dateMs % oneDay);

  const nowMs = now.getTime();
  const nowDayMs = nowMs - (nowMs % oneDay);

  return dateDayMs === nowDayMs - oneDay;
};

export default function publishDateFormat(
  value: Date | number | string,
  now = new Date(),
): string {
  const date = new Date(value);

  // Calculate time delta in milliseconds.
  const dt = now.getTime() - date.getTime();

  if (dt <= oneMinute) return 'Now';

  if (dt <= oneDay) {
    return 'Today';
  }

  if (isYesterday(date, now)) return 'Yesterday';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}
