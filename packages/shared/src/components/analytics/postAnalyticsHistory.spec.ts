import { postAnalyticsHistoryLimit } from '../../graphql/posts';
import { buildAnalyticsHistoryDays } from './postAnalyticsHistory';

const toNode = (item?: { date: Date; value: number }) => ({
  value: item?.value ?? 0,
});

afterEach(() => {
  jest.useRealTimers();
});

it.each(['Asia/Tokyo', 'America/Los_Angeles', 'UTC'])(
  'should give every day its own label in %s',
  (timezone) => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-16T05:00:00.000Z'));

    const days = buildAnalyticsHistoryDays({
      items: [
        { date: new Date('2026-11-15T00:00:00.000Z'), value: 3 },
        { date: new Date('2026-11-01T00:00:00.000Z'), value: 7 },
      ],
      timezone,
      toNode,
    });

    expect(days).toHaveLength(postAnalyticsHistoryLimit);
    expect(new Set(days.map(({ name }) => name)).size).toBe(
      postAnalyticsHistoryLimit,
    );
  },
);

it('should put each item on its day in the user timezone', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-11-16T05:00:00.000Z'));

  const days = buildAnalyticsHistoryDays({
    items: [{ date: new Date('2026-11-15T00:00:00.000Z'), value: 3 }],
    timezone: 'America/Los_Angeles',
    toNode,
  });

  expect(days.at(-1)?.name).toBe('Nov 15');
  expect(days.find(({ value }) => value === 3)?.name).toBe('Nov 14');
});
