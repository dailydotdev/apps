import { useCallback, useSyncExternalStore } from 'react';
import { mirrorToExtensionStorage } from '../../../lib/extensionStorage';

// Sunday=0 ... Saturday=6 to match `Date.prototype.getDay()`.
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAYS: ReadonlyArray<{
  value: Weekday;
  short: string;
  long: string;
}> = [
  { value: 1, short: 'Mon', long: 'Monday' },
  { value: 2, short: 'Tue', long: 'Tuesday' },
  { value: 3, short: 'Wed', long: 'Wednesday' },
  { value: 4, short: 'Thu', long: 'Thursday' },
  { value: 5, short: 'Fri', long: 'Friday' },
  { value: 6, short: 'Sat', long: 'Saturday' },
  { value: 0, short: 'Sun', long: 'Sunday' },
];

export interface FocusWindow {
  weekday: Weekday;
  /** "HH:mm" 24h. Inclusive. */
  start: string;
  /** "HH:mm" 24h. Exclusive. */
  end: string;
}

export type FocusWindowsMode =
  // Within `windows` the user wants the feed visible; outside, Focus.
  | 'feed_during'
  // Within `windows` the user wants Focus; outside, the feed.
  | 'focus_during';

export interface FocusSchedule {
  /**
   * Epoch ms when an ad-hoc pause should expire. While `pauseUntil > now`
   * Focus is suspended and the feed shows even if the user's default mode
   * is Focus. Null when not paused.
   */
  pauseUntil: number | null;
  /** Recurring weekly windows. */
  windows: FocusWindow[];
  /** How `windows` map onto the rendered surface. */
  windowsMode: FocusWindowsMode;
  /** Master switch for recurring windows. Pause-now ignores this. */
  enabled: boolean;
}

export const DEFAULT_FOCUS_SCHEDULE: FocusSchedule = {
  pauseUntil: null,
  windows: [],
  windowsMode: 'focus_during',
  enabled: false,
};

export const FOCUS_SCHEDULE_STORAGE_KEY = 'newtab:focus-schedule';
const CHANGE_EVENT = 'newtab:focus-schedule:changed';

interface SnapshotCache {
  raw: string | null;
  value: FocusSchedule;
}

let cache: SnapshotCache = { raw: null, value: DEFAULT_FOCUS_SCHEDULE };

const read = (): FocusSchedule => {
  if (typeof window === 'undefined') {
    return DEFAULT_FOCUS_SCHEDULE;
  }
  const raw = window.localStorage.getItem(FOCUS_SCHEDULE_STORAGE_KEY);
  if (raw === cache.raw) {
    return cache.value;
  }
  let value: FocusSchedule = DEFAULT_FOCUS_SCHEDULE;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<FocusSchedule>;
      value = {
        ...DEFAULT_FOCUS_SCHEDULE,
        ...parsed,
        windows: Array.isArray(parsed?.windows) ? parsed.windows : [],
      };
    } catch {
      value = DEFAULT_FOCUS_SCHEDULE;
    }
  }
  cache = { raw, value };
  return value;
};

const write = (value: FocusSchedule): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const raw = JSON.stringify(value);
  window.localStorage.setItem(FOCUS_SCHEDULE_STORAGE_KEY, raw);
  cache = { raw, value };
  // Mirror so the extension service worker (e.g. for site blocking) can
  // make schedule-aware decisions without rebuilding the parser.
  mirrorToExtensionStorage(FOCUS_SCHEDULE_STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

const subscribe = (cb: () => void): (() => void) => {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
};

const getServerSnapshot = (): FocusSchedule => DEFAULT_FOCUS_SCHEDULE;

const HHMM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const isValidTimeString = (value: string): boolean =>
  HHMM_PATTERN.test(value);

const toMinutes = (value: string): number => {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Returns true when the given moment falls inside any `windows` entry. Pure
 * so we can unit-test against fixed Date instances. Windows are local-time;
 * if `end <= start` the window wraps past midnight (e.g. 22:00 -> 06:00).
 */
export const isInsideAnyWindow = (
  windows: ReadonlyArray<FocusWindow>,
  date: Date = new Date(),
): boolean => {
  if (windows.length === 0) {
    return false;
  }
  const todayWeekday = date.getDay() as Weekday;
  // Yesterday's wrap-around windows still apply if their `end` lands today.
  const yesterdayWeekday = ((todayWeekday + 6) % 7) as Weekday;
  const minutesNow = date.getHours() * 60 + date.getMinutes();

  return windows.some((win) => {
    if (!isValidTimeString(win.start) || !isValidTimeString(win.end)) {
      return false;
    }
    const start = toMinutes(win.start);
    const end = toMinutes(win.end);
    const sameDay = win.weekday === todayWeekday;
    const wraps = end <= start;

    if (!wraps) {
      return sameDay && minutesNow >= start && minutesNow < end;
    }

    // Wrapping windows belong to two days: the start side runs from `start`
    // until midnight on `weekday`, the tail runs from midnight to `end` on
    // the next day.
    if (sameDay && minutesNow >= start) {
      return true;
    }
    if (win.weekday === yesterdayWeekday && minutesNow < end) {
      return true;
    }
    return false;
  });
};

/**
 * Resolves whether Focus should currently take over the new tab. Pause-now
 * means "give me the feed for a few hours" — so an active pause forces
 * Focus off, regardless of the recurring schedule. Pure helper.
 */
export const isFocusActiveAt = (
  schedule: FocusSchedule,
  date: Date = new Date(),
): boolean => {
  if (schedule.pauseUntil && schedule.pauseUntil > date.getTime()) {
    return false;
  }
  if (!schedule.enabled || schedule.windows.length === 0) {
    return false;
  }
  const inside = isInsideAnyWindow(schedule.windows, date);
  return schedule.windowsMode === 'focus_during' ? inside : !inside;
};

/**
 * Mutation API. Callers can either patch top-level fields or use the helpers
 * below for window CRUD and pause presets — keeping the per-action call
 * sites slim and testable.
 */
export interface UseFocusSchedule {
  schedule: FocusSchedule;
  setSchedule: (next: FocusSchedule) => void;
  setEnabled: (enabled: boolean) => void;
  setWindowsMode: (mode: FocusWindowsMode) => void;
  upsertWindow: (window: FocusWindow) => void;
  removeWindow: (weekday: Weekday) => void;
  pauseFor: (durationMs: number | null) => void;
  pauseUntilTomorrow: (date?: Date) => void;
}

export const useFocusSchedule = (): UseFocusSchedule => {
  const schedule = useSyncExternalStore(subscribe, read, getServerSnapshot);

  const setSchedule = useCallback((next: FocusSchedule) => {
    write(next);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    write({ ...read(), enabled });
  }, []);

  const setWindowsMode = useCallback((mode: FocusWindowsMode) => {
    write({ ...read(), windowsMode: mode });
  }, []);

  // One window per weekday — keeps the UI a single chip-grid. Editing the
  // existing day replaces it; new days append. Callers can build multi-range
  // weekdays by removing & re-adding if we ever expose that affordance.
  const upsertWindow = useCallback((window: FocusWindow) => {
    const current = read();
    const filtered = current.windows.filter(
      (existing) => existing.weekday !== window.weekday,
    );
    write({
      ...current,
      enabled: true,
      windows: [...filtered, window].sort((a, b) => a.weekday - b.weekday),
    });
  }, []);

  const removeWindow = useCallback((weekday: Weekday) => {
    const current = read();
    write({
      ...current,
      windows: current.windows.filter((win) => win.weekday !== weekday),
    });
  }, []);

  const pauseFor = useCallback((durationMs: number | null) => {
    const current = read();
    write({
      ...current,
      pauseUntil: durationMs === null ? null : Date.now() + durationMs,
    });
  }, []);

  const pauseUntilTomorrow = useCallback((date: Date = new Date()) => {
    // Resume at 6am local time tomorrow — the canonical "until next morning"
    // expectation users have for this kind of preset.
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    next.setHours(6, 0, 0, 0);
    write({ ...read(), pauseUntil: next.getTime() });
  }, []);

  return {
    schedule,
    setSchedule,
    setEnabled,
    setWindowsMode,
    upsertWindow,
    removeWindow,
    pauseFor,
    pauseUntilTomorrow,
  };
};
