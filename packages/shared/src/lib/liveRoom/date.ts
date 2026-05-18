import { addDays, isSameDay } from 'date-fns';

export const formatLiveRoomScheduledStart = (value: string): string => {
  const date = new Date(value);
  const now = new Date();
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isSameDay(date, now)) {
    return `Today at ${time}`;
  }

  if (isSameDay(date, addDays(now, 1))) {
    return `Tomorrow at ${time}`;
  }

  return `${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} at ${time}`;
};
