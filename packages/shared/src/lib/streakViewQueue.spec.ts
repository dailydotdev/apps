import { isStreakViewCreditable } from './streakViewQueue';

const tz = 'Europe/Amsterdam';
// CET (UTC+1), no DST in January
const at = new Date('2026-01-12T21:30:00+01:00');

describe('isStreakViewCreditable', () => {
  it('should credit a view from the same local day', () => {
    expect(
      isStreakViewCreditable(at, new Date('2026-01-12T23:59:00+01:00'), tz),
    ).toBe(true);
  });

  it('should credit a view from yesterday within the early-morning grace window', () => {
    expect(
      isStreakViewCreditable(at, new Date('2026-01-13T00:10:00+01:00'), tz),
    ).toBe(true);
    expect(
      isStreakViewCreditable(at, new Date('2026-01-13T02:59:00+01:00'), tz),
    ).toBe(true);
  });

  it('should drop a view from yesterday once the grace window closes', () => {
    expect(
      isStreakViewCreditable(at, new Date('2026-01-13T03:00:00+01:00'), tz),
    ).toBe(false);
  });

  it('should drop a view older than a day even inside the grace window', () => {
    expect(
      isStreakViewCreditable(at, new Date('2026-01-14T01:00:00+01:00'), tz),
    ).toBe(false);
  });

  it('should use the profile timezone for the day boundary', () => {
    // 14:30Z is 23:30 in Tokyo; four hours later the grace window has closed
    // there while Amsterdam is still on the same day
    expect(
      isStreakViewCreditable(
        new Date('2026-01-13T14:30:00Z'),
        new Date('2026-01-13T18:30:00Z'),
        'Asia/Tokyo',
      ),
    ).toBe(false);
    expect(
      isStreakViewCreditable(
        new Date('2026-01-13T14:30:00Z'),
        new Date('2026-01-13T18:30:00Z'),
        tz,
      ),
    ).toBe(true);
  });
});
