import { startOfDay } from 'date-fns';
import type { differenceInDays } from 'date-fns';

export const getAbsoluteDifferenceInDays: typeof differenceInDays = (
  date1,
  date2,
) => {
  const day1 = startOfDay(date1);
  const day2 = startOfDay(date2);

  const timeDiff = Math.abs(day1.getTime() - day2.getTime());
  const diffInDays = timeDiff / (1000 * 60 * 60 * 24);

  // Round down to the nearest whole number since we want full days
  return Math.floor(diffInDays);
};
