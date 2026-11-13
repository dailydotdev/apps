import { hasStreakViewToday } from './userStreak';

const tz = 'Europe/Amsterdam';
// CET (UTC+1), no DST in January
const now = new Date('2026-01-13T00:30:00+01:00');

describe('hasStreakViewToday', () => {
  it('should be true when lastViewAt is today in the profile timezone', () => {
    expect(
      hasStreakViewToday(
        { lastViewAt: new Date('2026-01-13T00:05:00+01:00') },
        tz,
        now,
      ),
    ).toBe(true);
  });

  it('should be false when lastViewAt is the previous local day', () => {
    expect(
      hasStreakViewToday(
        { lastViewAt: new Date('2026-01-12T23:50:00+01:00') },
        tz,
        now,
      ),
    ).toBe(false);
  });

  it('should accept a serialized lastViewAt', () => {
    expect(
      hasStreakViewToday(
        {
          lastViewAt: '2026-01-12T23:10:00.000Z' as unknown as Date,
        },
        tz,
        now,
      ),
    ).toBe(true);
  });

  it('should be false without a streak or lastViewAt', () => {
    expect(hasStreakViewToday(undefined, tz, now)).toBe(false);
    expect(
      hasStreakViewToday({ lastViewAt: undefined as unknown as Date }, tz, now),
    ).toBe(false);
  });
});
