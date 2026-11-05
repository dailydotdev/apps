import {
  getCurrentWeekStart,
  getIsoWeekNumber,
  getPickPostHref,
} from './picks';

describe('getIsoWeekNumber', () => {
  it.each([
    ['2026-11-02', 45],
    ['2025-12-29', 1],
    ['2026-01-01', 1],
    ['2026-12-28', 53],
    ['2027-01-04', 1],
    ['2024-12-30', 1],
    ['2021-01-03', 53],
    ['2026-01-05', 2],
  ])('should return the ISO week of %s', (date, week) => {
    expect(getIsoWeekNumber(date)).toBe(week);
  });
});

describe('getCurrentWeekStart', () => {
  it('should return the Monday of the week in UTC', () => {
    expect(getCurrentWeekStart(new Date('2026-11-05T23:30:00Z'))).toBe(
      '2026-11-02',
    );
    expect(getCurrentWeekStart(new Date('2026-11-08T23:59:59Z'))).toBe(
      '2026-11-02',
    );
    expect(getCurrentWeekStart(new Date('2026-11-09T00:00:00Z'))).toBe(
      '2026-11-09',
    );
  });
});

describe('getPickPostHref', () => {
  it('should append the author id', () => {
    expect(getPickPostHref('https://app.daily.dev/posts/abc', 'u1')).toBe(
      'https://app.daily.dev/posts/abc?userid=u1',
    );
  });

  it('should keep existing query params', () => {
    expect(getPickPostHref('https://app.daily.dev/posts/abc?a=1', 'u1')).toBe(
      'https://app.daily.dev/posts/abc?a=1&userid=u1',
    );
  });
});
