import { format, parseISO, subDays } from 'date-fns';
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

  // Today's calendar date for the user, so the days and their labels agree
  const today = parseISO(
    dateFormatInTimezone(new Date(), 'yyyy-MM-dd', timezone),
  );

  return Array.from({ length: postAnalyticsHistoryLimit }, (_, index) => {
    const day = subDays(today, postAnalyticsHistoryLimit - 1 - index);

    return {
      ...(nodes[format(day, 'yyyy-MM-dd')] ?? toNode()),
      name: format(day, 'MMM d'),
    };
  });
};
