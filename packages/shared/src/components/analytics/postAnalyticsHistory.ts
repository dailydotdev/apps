import { addDays, subDays } from 'date-fns';
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

const formatDayName = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

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

  const daysMap = items.reduce(
    (acc, item) => {
      const date = dateFormatInTimezone(
        new Date(item.date),
        'yyyy-MM-dd',
        timezone,
      );

      acc[date] = {
        ...toNode(item),
        name: formatDayName(new Date(item.date)),
      };

      return acc;
    },
    {} as Record<string, PostAnalyticsHistoryDay<T>>,
  );

  const historyCutOffDate = subDays(new Date(), postAnalyticsHistoryLimit - 1);

  const days: PostAnalyticsHistoryDay<T>[] = [];

  for (let i = 0; i < postAnalyticsHistoryLimit; i += 1) {
    const paddedDate = addDays(historyCutOffDate, i);
    const date = dateFormatInTimezone(paddedDate, 'yyyy-MM-dd', timezone);

    days.push(
      daysMap[date] ?? {
        ...toNode(),
        name: formatDayName(paddedDate),
      },
    );
  }

  return days;
};
