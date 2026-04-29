import {
  DEFAULT_FOCUS_SCHEDULE,
  isFocusActiveAt,
  isInsideAnyWindow,
  type FocusSchedule,
} from './focusSchedule.store';

describe('focusSchedule.store helpers', () => {
  // 2026-04-22 was a Wednesday in real life — picked deliberately so a
  // weekday=3 window matches and we can sanity-check off-by-one bugs.
  const wednesdayAt = (h: number, m: number = 0): Date =>
    new Date(2026, 3, 22, h, m, 0, 0);

  it('returns false when there are no windows', () => {
    expect(isInsideAnyWindow([], wednesdayAt(12))).toBe(false);
  });

  it('returns true inside a same-day window', () => {
    const windows = [{ weekday: 3 as const, start: '09:00', end: '17:00' }];
    expect(isInsideAnyWindow(windows, wednesdayAt(10, 30))).toBe(true);
  });

  it('treats start as inclusive and end as exclusive', () => {
    const windows = [{ weekday: 3 as const, start: '09:00', end: '17:00' }];
    expect(isInsideAnyWindow(windows, wednesdayAt(9))).toBe(true);
    expect(isInsideAnyWindow(windows, wednesdayAt(17))).toBe(false);
  });

  it('handles a wrap-around window across midnight', () => {
    const windows = [{ weekday: 3 as const, start: '22:00', end: '06:00' }];
    expect(isInsideAnyWindow(windows, wednesdayAt(23, 30))).toBe(true);
    // Thursday 04:00 should still match the Wed 22->Thu 06 window.
    const thursdayAt4 = new Date(2026, 3, 23, 4, 0, 0, 0);
    expect(isInsideAnyWindow(windows, thursdayAt4)).toBe(true);
    // Thursday 07:00 must be outside.
    const thursdayAt7 = new Date(2026, 3, 23, 7, 0, 0, 0);
    expect(isInsideAnyWindow(windows, thursdayAt7)).toBe(false);
  });

  it('rejects malformed time strings without throwing', () => {
    const windows = [
      { weekday: 3 as const, start: 'bogus', end: '17:00' },
      { weekday: 3 as const, start: '09:00', end: '99:99' },
    ];
    expect(isInsideAnyWindow(windows, wednesdayAt(10))).toBe(false);
  });

  it('isFocusActiveAt forces Focus off while pauseUntil is in the future', () => {
    // Pause-now means "give me the feed for a few hours", so Focus must
    // surrender even when the recurring schedule says it should be active.
    const schedule: FocusSchedule = {
      ...DEFAULT_FOCUS_SCHEDULE,
      enabled: true,
      windows: [{ weekday: 3, start: '09:00', end: '17:00' }],
      windowsMode: 'focus_during',
      pauseUntil: wednesdayAt(12).getTime() + 1000,
    };
    expect(isFocusActiveAt(schedule, wednesdayAt(12))).toBe(false);
  });

  it('isFocusActiveAt resumes the schedule once pauseUntil has expired', () => {
    const schedule: FocusSchedule = {
      ...DEFAULT_FOCUS_SCHEDULE,
      enabled: true,
      windows: [{ weekday: 3, start: '09:00', end: '17:00' }],
      windowsMode: 'focus_during',
      pauseUntil: wednesdayAt(11).getTime(),
    };
    expect(isFocusActiveAt(schedule, wednesdayAt(12))).toBe(true);
  });

  it('isFocusActiveAt requires enabled=true to honour windows', () => {
    const schedule: FocusSchedule = {
      ...DEFAULT_FOCUS_SCHEDULE,
      enabled: false,
      windows: [{ weekday: 3, start: '09:00', end: '17:00' }],
      windowsMode: 'focus_during',
    };
    expect(isFocusActiveAt(schedule, wednesdayAt(10))).toBe(false);
  });

  it('isFocusActiveAt inverts the result for windowsMode=feed_during', () => {
    const base: FocusSchedule = {
      ...DEFAULT_FOCUS_SCHEDULE,
      enabled: true,
      windows: [{ weekday: 3, start: '09:00', end: '17:00' }],
    };
    expect(
      isFocusActiveAt(
        { ...base, windowsMode: 'focus_during' },
        wednesdayAt(10),
      ),
    ).toBe(true);
    expect(
      isFocusActiveAt({ ...base, windowsMode: 'feed_during' }, wednesdayAt(10)),
    ).toBe(false);
    expect(
      isFocusActiveAt({ ...base, windowsMode: 'feed_during' }, wednesdayAt(20)),
    ).toBe(true);
  });
});
