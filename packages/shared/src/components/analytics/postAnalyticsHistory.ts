import type { TickProp } from 'recharts/types/util/types';
import { postAnalyticsHistoryLimit } from '../../graphql/posts';
import { dateFormatInTimezone } from '../../lib/timezones';

export type PostAnalyticsHistoryDay<T> = T & {
  name: string;
};

export const historyChartTickProp: TickProp = {
  fill: 'var(--theme-text-tertiary)',
  fontSize: '0.6875rem',
};

// Noon UTC on the calendar day, so no DST shift skips or repeats a day
const getHistoryDay = (today: string, daysAgo: number): Date => {
  const [year, month, day] = today.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day - daysAgo, 12));
};

export const buildAnalyticsHistoryDays = <TItem extends { date: Date }, T>({
  items,
  timezone,
  toNode,
}: {
  items: TItem[] | undefined;
  timezone: string;
  toNode: (item?: TItem) => T;
}): PostAnalyticsHistoryDay<T>[] => {
  if (!items) {
    return [];
  }

  const nodes = items.reduce(
    (acc, item) => {
      const date = dateFormatInTimezone(
        new Date(item.date),
        'yyyy-MM-dd',
        timezone,
      );

      acc[date] = toNode(item);

      return acc;
    },
    {} as Record<string, T>,
  );

  const today = dateFormatInTimezone(new Date(), 'yyyy-MM-dd', timezone);

  return Array.from({ length: postAnalyticsHistoryLimit }, (_, index) => {
    const day = getHistoryDay(today, postAnalyticsHistoryLimit - 1 - index);
    const date = dateFormatInTimezone(day, 'yyyy-MM-dd', 'UTC');

    return {
      ...(nodes[date] ?? toNode()),
      name: dateFormatInTimezone(day, 'MMM d', 'UTC'),
    };
  });
};
