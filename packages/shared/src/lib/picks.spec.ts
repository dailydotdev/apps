import {
  getCurrentWeekStart,
  getIsoWeekNumber,
  getPickPostHref,
  isNewPicksViewer,
  isPicksNudgeDay,
  getPicksDeadlineLabel,
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

describe('isPicksNudgeDay', () => {
  it('should be Thursday to Sunday in local time', () => {
    const local = (iso: string) => new Date(`${iso}T12:00:00`);
    expect(isPicksNudgeDay(local('2026-11-02'))).toBe(false); // Monday
    expect(isPicksNudgeDay(local('2026-11-04'))).toBe(false); // Wednesday
    expect(isPicksNudgeDay(local('2026-11-05'))).toBe(true); // Thursday
    expect(isPicksNudgeDay(local('2026-11-06'))).toBe(true); // Friday
    expect(isPicksNudgeDay(local('2026-11-08'))).toBe(true); // Sunday
  });
});

describe('getPicksDeadlineLabel', () => {
  it('should name Sunday until it is Sunday', () => {
    const local = (iso: string) => new Date(`${iso}T12:00:00`);
    expect(getPicksDeadlineLabel(local('2026-11-05'))).toBe('Closes Sunday');
    expect(getPicksDeadlineLabel(local('2026-11-08'))).toBe('Closes today');
  });
});

describe('getPickPostHref', () => {
  it('should append the author id', () => {
    expect(getPickPostHref('https://app.daily.dev/posts/abc', 'u1')).toBe(
      'https://app.daily.dev/posts/abc?userid=u1&cid=share_picks',
    );
  });

  it('should keep existing query params', () => {
    expect(getPickPostHref('https://app.daily.dev/posts/abc?a=1', 'u1')).toBe(
      'https://app.daily.dev/posts/abc?a=1&userid=u1&cid=share_picks',
    );
  });
});

describe('isNewPicksViewer', () => {
  const now = new Date('2026-11-05T12:00:00.000Z');

  it('should be true within the first week', () => {
    expect(isNewPicksViewer('2026-11-04T12:00:00.000Z', now)).toBe(true);
    expect(isNewPicksViewer('2026-10-29T12:00:00.001Z', now)).toBe(true);
  });

  it('should be false after a week or without a date', () => {
    expect(isNewPicksViewer('2026-10-29T12:00:00.000Z', now)).toBe(false);
    expect(isNewPicksViewer(undefined, now)).toBe(false);
    expect(isNewPicksViewer('not a date', now)).toBe(false);
  });
});
