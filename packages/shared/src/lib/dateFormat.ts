import {
  addDays,
  format,
  isEqual,
  isSameDay,
  isSameYear,
  subDays,
} from 'date-fns';

export const oneMinute = 60;
export const oneHour = 3600;
export const oneDay = 86400;
const oneWeek = 7 * oneDay;
export const oneYear = oneDay * 365;

export const publishTimeRelativeShort = (
  value: Date | number | string,
  now = new Date(),
): string => {
  const date = new Date(value);

  // Calculate time delta in seconds.
  const dt = (now.getTime() - date.getTime()) / 1000;

  if (dt <= oneMinute) {
    return 'now';
  }

  if (dt <= oneHour) {
    const numMinutes = Math.round(dt / oneMinute);
    return `${numMinutes}m`;
  }

  if (dt <= oneDay) {
    const numHours = Math.round(dt / oneHour);
    return `${numHours}h`;
  }

  if (dt <= oneWeek) {
    const numDays = Math.round(dt / oneDay);
    return `${numDays}d`;
  }

  if (dt <= oneYear) {
    const numWeeks = Math.round(dt / oneWeek);
    return `${numWeeks}w`;
  }

  const numYears = Math.round(dt / oneYear);
  return `${numYears}y`;
};

export const publishTimeLiveTimer: typeof publishTimeRelativeShort = (
  value,
  now = new Date(),
) => {
  const date = new Date(value);

  const dt = (now.getTime() - date.getTime()) / 1000;

  if (dt <= oneMinute) {
    const numSeconds = Math.round(dt) || 1; // always show at least 1s to show timer running

    return `${numSeconds}s`;
  }

  return publishTimeRelativeShort(value, now);
};

export enum TimeFormatType {
  Post = 'post',
  Comment = 'comment',
  ReadHistory = 'readHistory',
  TopReaderBadge = 'topReaderBadge',
  PlusMember = 'plusMember',
  Transaction = 'transaction',
  LastActivity = 'lastActivity',
  LiveTimer = 'liveTimer',
}

export function postDateFormat(
  value: Date | number | string,
  now = new Date(),
): string {
  const date = new Date(value);

  // Calculate time delta in seconds.
  const dt = (now.getTime() - date.getTime()) / 1000;

  if (dt <= oneMinute) {
    return 'Now';
  }

  if (isSameDay(date, now)) {
    return 'Today';
  }

  if (isSameDay(date, subDays(now, 1))) {
    return 'Yesterday';
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
  };
  if (!isSameYear(date, now)) {
    options.year = 'numeric';
  }
  return date.toLocaleString('en-US', options);
}

export function commentDateFormat(
  value: Date | number | string,
  now = new Date(),
): string {
  const date = new Date(value);
  const dt = (now.getTime() - date.getTime()) / 1000;

  if (dt <= oneMinute) {
    return 'Now';
  }

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
      day: 'numeric',
    });
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const isDateOnlyEqual = (left: Date, right: Date): boolean => {
  const formattedLeft = new Date(
    left.getFullYear(),
    left.getMonth(),
    left.getDate(),
  );
  const formattedRight = new Date(
    right.getFullYear(),
    right.getMonth(),
    right.getDate(),
  );

  return isEqual(formattedLeft, formattedRight);
};

export const getReadHistoryDateFormat = (currentDate: Date): string => {
  const today = new Date();

  if (isDateOnlyEqual(today, currentDate)) {
    return 'Today';
  }

  if (isDateOnlyEqual(today, addDays(currentDate, 1))) {
    return 'Yesterday';
  }

  const dayOfTheWeek = format(currentDate, 'EEE');
  const dayOfTheMonth = currentDate.getDate();
  const month = format(currentDate, 'MMM');
  const currentYear = currentDate.getFullYear();
  const year = currentYear === today.getFullYear() ? '' : ` ${currentYear}`;

  return `${dayOfTheWeek}, ${dayOfTheMonth} ${month}${year}`;
};

export const getTopReaderBadgeDateFormat = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
  });
};

export const getPlusMemberDateFormat = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getLastActivityDateFormat = (
  value: Date | number | string,
): string => {
  const date = new Date(value);
  const now = new Date();

  // Calculate time delta in seconds.
  const dt = (now.getTime() - date.getTime()) / 1000;

  if (dt <= oneMinute) {
    return 'Now';
  }

  if (dt <= oneHour) {
    const numMinutes = Math.round(dt / oneMinute);
    return `${numMinutes} ${numMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  if (dt <= oneDay) {
    const numHours = Math.round(dt / oneHour);
    return `${numHours} ${numHours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (dt <= oneWeek) {
    const numDays = Math.round(dt / oneDay);
    return `${numDays} ${numDays === 1 ? 'day' : 'days'} ago`;
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

export const getTodayTz = (timeZone: string, now = new Date()): Date => {
  const timeZonedToday = now.toLocaleString('en', { timeZone });
  return new Date(timeZonedToday);
};

interface FormatDateProps {
  value: Date | number | string;
  type: TimeFormatType;
}

export const formatDate = ({ value, type }: FormatDateProps): string => {
  const date = new Date(value);

  if (type === TimeFormatType.Post) {
    return postDateFormat(date);
  }

  if (type === TimeFormatType.Comment) {
    return publishTimeRelativeShort(date);
  }

  if (type === TimeFormatType.ReadHistory) {
    return getReadHistoryDateFormat(date);
  }

  if (type === TimeFormatType.TopReaderBadge) {
    return getTopReaderBadgeDateFormat(date);
  }

  if (type === TimeFormatType.PlusMember) {
    return getPlusMemberDateFormat(date);
  }

  if (type === TimeFormatType.Transaction) {
    const isCurrentYear = isSameYear(date, new Date());

    return format(date, `MMM dd${isCurrentYear ? ' ' : ', yyyy '}HH:mm`);
  }

  if (type === TimeFormatType.LastActivity) {
    return getLastActivityDateFormat(date);
  }

  if (type === TimeFormatType.LiveTimer) {
    return publishTimeLiveTimer(date);
  }

  return postDateFormat(date);
};

export const formatMonthYearOnly = (date: Date): string =>
  new Date(date).toLocaleString('en-us', {
    month: 'short',
    year: 'numeric',
  });
