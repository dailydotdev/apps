import { getStreak } from './useStreakDays';
import { Streak } from '../../components/streak/popup/DayStreak';
import { DayOfWeek } from '../../lib/date';

describe('getStreak', () => {
  const timezone = 'Europe/Athens';
  // Wednesday 2026-11-11 10:00 local (UTC+2)
  const today = new Date('2026-11-11T08:00:00.000Z');
  // Tuesday 2026-11-10 noon local
  const tuesday = new Date('2026-11-10T10:00:00.000Z');

  it('should mark the local day of lastViewAt as read even without a history entry', () => {
    expect(
      getStreak({
        value: tuesday,
        today,
        history: [],
        startOfWeek: DayOfWeek.Monday,
        timezone,
        // A 01:00 Wednesday read credited to Tuesday: last ms of Tuesday local
        lastViewAt: '2026-11-10T21:59:59.999Z',
      }),
    ).toBe(Streak.Completed);
  });

  it('should leave a missed weekday upcoming when lastViewAt is another day', () => {
    expect(
      getStreak({
        value: tuesday,
        today,
        history: [],
        startOfWeek: DayOfWeek.Monday,
        timezone,
        lastViewAt: '2026-11-09T10:00:00.000Z',
      }),
    ).toBe(Streak.Upcoming);
  });
});
