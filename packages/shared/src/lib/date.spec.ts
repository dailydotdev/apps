import {
  formatTotalDuration,
  getDaysUntilWeeklyQuestReset,
  getWeeklyQuestPeriodEnd,
} from './date';

describe('getWeeklyQuestPeriodEnd', () => {
  it('returns the next Monday 00:00 UTC mid-week', () => {
    // 2026-06-24 is a Wednesday
    const periodEnd = getWeeklyQuestPeriodEnd(
      new Date('2026-06-24T15:30:00.000Z'),
    );

    expect(periodEnd.toISOString()).toBe('2026-06-29T00:00:00.000Z');
  });

  it('returns the last day of the week boundary on Sunday', () => {
    // 2026-06-28 is a Sunday
    const periodEnd = getWeeklyQuestPeriodEnd(
      new Date('2026-06-28T23:59:00.000Z'),
    );

    expect(periodEnd.toISOString()).toBe('2026-06-29T00:00:00.000Z');
  });

  it('returns the following Monday when called on a Monday', () => {
    // 2026-06-29 is a Monday
    const periodEnd = getWeeklyQuestPeriodEnd(
      new Date('2026-06-29T08:00:00.000Z'),
    );

    expect(periodEnd.toISOString()).toBe('2026-07-06T00:00:00.000Z');
  });
});

describe('getDaysUntilWeeklyQuestReset', () => {
  it('counts 1 day on the final day of the week', () => {
    expect(
      getDaysUntilWeeklyQuestReset(new Date('2026-06-28T23:59:00.000Z')),
    ).toBe(1);
  });

  it('counts a full week right after the Monday reset', () => {
    expect(
      getDaysUntilWeeklyQuestReset(new Date('2026-06-29T00:00:00.000Z')),
    ).toBe(7);
  });

  it('counts down through the week', () => {
    // Wednesday
    expect(
      getDaysUntilWeeklyQuestReset(new Date('2026-06-24T12:00:00.000Z')),
    ).toBe(5);
  });
});

describe('formatTotalDuration', () => {
  it('sums non-overlapping ranges without counting the gaps', () => {
    expect(
      formatTotalDuration([
        { startedAt: '2015-01-01', endedAt: '2016-01-01' },
        { startedAt: '2017-01-01', endedAt: '2018-01-01' },
        { startedAt: '2019-01-01', endedAt: '2020-01-01' },
        { startedAt: '2021-01-01', endedAt: '2022-01-01' },
        { startedAt: '2023-01-01', endedAt: '2024-01-01' },
      ]),
    ).toBe('5 years');
  });

  it('merges overlapping ranges instead of double counting', () => {
    expect(
      formatTotalDuration([
        { startedAt: '2020-01-01', endedAt: '2022-06-01' },
        { startedAt: '2021-06-01', endedAt: '2023-01-01' },
      ]),
    ).toBe('3 years');
  });

  it('treats a missing endedAt as an ongoing position', () => {
    expect(
      formatTotalDuration([{ startedAt: '2015-01-01', endedAt: null }]),
    ).not.toBe('Less than a month');
  });

  it('falls back to "Less than a month" for sub-month durations', () => {
    expect(
      formatTotalDuration([{ startedAt: '2023-01-01', endedAt: '2023-01-10' }]),
    ).toBe('Less than a month');
  });
});
