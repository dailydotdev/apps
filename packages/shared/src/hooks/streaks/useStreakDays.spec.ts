import { getStreak } from './useStreakDays';
import { Streak } from '../../components/streak/popup/DayStreak';
import { DayOfWeek } from '../../lib/date';

// Thursday 12 Nov 2026 in every zone used below.
const today = new Date('2026-11-12T12:00:00.000Z');

describe('getStreak missed day', () => {
  it('marks the missed local date, compared in the reset timezone', () => {
    // 23:00 UTC on the 9th is already the 10th in Amsterdam...
    const value = new Date('2026-11-09T23:00:00.000Z');

    expect(
      getStreak({
        value,
        today,
        history: [],
        startOfWeek: DayOfWeek.Monday,
        timezone: 'Europe/Amsterdam',
        missedDate: '2026-11-10',
        missedDateTimezone: 'Europe/Amsterdam',
      }),
    ).toBe(Streak.Missed);

    // ...but still the 9th in UTC, so a UTC-based compare must not match.
    expect(
      getStreak({
        value,
        today,
        history: [],
        startOfWeek: DayOfWeek.Monday,
        timezone: 'Etc/UTC',
        missedDate: '2026-11-10',
        missedDateTimezone: 'Etc/UTC',
      }),
    ).toBe(Streak.Upcoming);
  });

  it('never marks a day that has a read as missed', () => {
    expect(
      getStreak({
        value: new Date('2026-11-10T12:00:00.000Z'),
        today,
        history: [{ date: '2026-11-10T08:00:00.000Z', reads: 1 }],
        startOfWeek: DayOfWeek.Monday,
        timezone: 'Etc/UTC',
        missedDate: '2026-11-10',
        missedDateTimezone: 'Etc/UTC',
      }),
    ).toBe(Streak.Completed);
  });

  it('leaves other days untouched', () => {
    expect(
      getStreak({
        value: new Date('2026-11-11T12:00:00.000Z'),
        today,
        history: [],
        startOfWeek: DayOfWeek.Monday,
        timezone: 'Etc/UTC',
        missedDate: '2026-11-10',
        missedDateTimezone: 'Etc/UTC',
      }),
    ).toBe(Streak.Upcoming);
  });
});

describe('getStreak paused day', () => {
  // Fri 13 Nov to Mon 16 Nov 2026, local dates in Amsterdam.
  const pause = { start: '2026-11-13', end: '2026-11-16' };
  const base = {
    today,
    startOfWeek: DayOfWeek.Monday,
    timezone: 'Europe/Amsterdam',
    pause,
  };

  it('marks upcoming and weekend days inside the pause as paused', () => {
    expect(
      getStreak({ ...base, value: new Date('2026-11-13T12:00:00.000Z') }),
    ).toBe(Streak.Paused);
    // Saturday: paused beats the weekend freeze.
    expect(
      getStreak({ ...base, value: new Date('2026-11-14T12:00:00.000Z') }),
    ).toBe(Streak.Paused);
  });

  it('marks today as paused instead of pending', () => {
    expect(
      getStreak({
        ...base,
        pause: { start: '2026-11-12', end: '2026-11-16' },
        value: today,
      }),
    ).toBe(Streak.Paused);
  });

  it('compares the pause bounds in the user timezone', () => {
    // 23:30 UTC on the 16th is already the 17th in Amsterdam...
    const value = new Date('2026-11-16T23:30:00.000Z');
    expect(getStreak({ ...base, value })).toBe(Streak.Upcoming);
    // ...but still the 16th in UTC.
    expect(getStreak({ ...base, value, timezone: 'Etc/UTC' })).toBe(
      Streak.Paused,
    );
  });

  it('still shows a read day inside the pause as completed', () => {
    expect(
      getStreak({
        ...base,
        pause: { start: '2026-11-11', end: '2026-11-16' },
        value: new Date('2026-11-11T12:00:00.000Z'),
        history: [{ date: '2026-11-11T08:00:00.000Z', reads: 1 }],
      }),
    ).toBe(Streak.Completed);
  });
});
