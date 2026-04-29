import {
  defaultFocusSchedule,
  isFocusActiveAt,
  isInsideAnyWindow,
  isPauseActive,
  minutesSinceMidnight,
} from './focusSchedule';

const at = (
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
  h: number,
  m = 0,
): Date => {
  // Pick an arbitrary Monday (2024-01-01 is a Monday) and offset by weekday
  const monday = new Date(2024, 0, 1);
  const offset = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(day);
  monday.setDate(monday.getDate() + offset);
  monday.setHours(h, m, 0, 0);
  return monday;
};

describe('minutesSinceMidnight', () => {
  it('converts hours and minutes', () => {
    expect(minutesSinceMidnight(at('mon', 9, 30))).toBe(9 * 60 + 30);
    expect(minutesSinceMidnight(at('mon', 0, 0))).toBe(0);
  });
});

describe('defaultFocusSchedule', () => {
  it('seeds 9-17 windows for every weekday, all disabled', () => {
    const schedule = defaultFocusSchedule();
    expect(schedule.pauseUntil).toBeNull();
    expect(Object.keys(schedule.windows ?? {})).toHaveLength(7);
    expect(schedule.windows?.mon).toEqual({
      start: 540,
      end: 1020,
      enabled: false,
    });
  });
});

describe('isInsideAnyWindow', () => {
  it('returns false when there are no windows', () => {
    expect(isInsideAnyWindow(undefined, at('mon', 10))).toBe(false);
    expect(isInsideAnyWindow({ windows: {} }, at('mon', 10))).toBe(false);
  });

  it('only matches the day the window is set on', () => {
    const schedule = {
      windows: {
        mon: { start: 9 * 60, end: 17 * 60, enabled: true },
      },
    };
    expect(isInsideAnyWindow(schedule, at('mon', 10))).toBe(true);
    expect(isInsideAnyWindow(schedule, at('tue', 10))).toBe(false);
  });

  it('returns false when window is disabled', () => {
    const schedule = {
      windows: {
        mon: { start: 9 * 60, end: 17 * 60, enabled: false },
      },
    };
    expect(isInsideAnyWindow(schedule, at('mon', 10))).toBe(false);
  });

  it('handles overnight windows that wrap past midnight', () => {
    const schedule = {
      windows: {
        mon: { start: 22 * 60, end: 6 * 60, enabled: true },
      },
    };
    expect(isInsideAnyWindow(schedule, at('mon', 23))).toBe(true);
    expect(isInsideAnyWindow(schedule, at('tue', 5))).toBe(true);
    expect(isInsideAnyWindow(schedule, at('mon', 12))).toBe(false);
  });
});

describe('isPauseActive', () => {
  it('is true while pauseUntil lies in the future', () => {
    const now = at('mon', 10);
    expect(isPauseActive({ pauseUntil: now.getTime() + 60_000 }, now)).toBe(
      true,
    );
  });

  it('is false when pauseUntil is past', () => {
    const now = at('mon', 10);
    expect(isPauseActive({ pauseUntil: now.getTime() - 60_000 }, now)).toBe(
      false,
    );
  });

  it('is false when pauseUntil is missing', () => {
    expect(isPauseActive({ pauseUntil: null }, new Date())).toBe(false);
    expect(isPauseActive(undefined, new Date())).toBe(false);
  });
});

describe('isFocusActiveAt', () => {
  const schedule = {
    windows: {
      mon: { start: 9 * 60, end: 17 * 60, enabled: true },
    },
  };

  it('is true inside an active window with no pause', () => {
    expect(isFocusActiveAt(schedule, at('mon', 10))).toBe(true);
  });

  it('is false outside any window', () => {
    expect(isFocusActiveAt(schedule, at('mon', 8))).toBe(false);
  });
});
