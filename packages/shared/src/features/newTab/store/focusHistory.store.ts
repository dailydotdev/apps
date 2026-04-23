import { useCallback, useSyncExternalStore } from 'react';

export interface FocusHistoryEntry {
  // Epoch ms the session completed. Used for weekly/monthly aggregation.
  completedAt: number;
  // Planned duration of the session (what we credit the user with).
  durationMinutes: number;
}

const STORAGE_KEY = 'newtab:focus-history';
const CHANGE_EVENT = 'newtab:focus-history:changed';

// Cap the history at ~90 days so the store never balloons. 1 session per
// break x 90 days = trivially small, but we still cap to prevent misuse.
const MAX_ENTRIES = 365;

let cachedRaw: string | null = null;
let cachedValue: FocusHistoryEntry[] = [];

const read = (): FocusHistoryEntry[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedValue;
  }
  let value: FocusHistoryEntry[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        value = parsed
          .filter(
            (entry): entry is FocusHistoryEntry =>
              typeof entry === 'object' &&
              entry !== null &&
              typeof (entry as FocusHistoryEntry).completedAt === 'number' &&
              typeof (entry as FocusHistoryEntry).durationMinutes === 'number',
          )
          .slice(-MAX_ENTRIES);
      }
    } catch {
      value = [];
    }
  }
  cachedRaw = raw;
  cachedValue = value;
  return value;
};

const write = (value: FocusHistoryEntry[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const trimmed = value.slice(-MAX_ENTRIES);
  const raw = JSON.stringify(trimmed);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedValue = trimmed;
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

const getServerSnapshot = (): FocusHistoryEntry[] => [];

// Monday-based week start matches the most common user expectation and
// aligns with the existing streak system. If we ever make this locale-aware
// we'll expose `weekStart` on SettingsContext.
const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  const diff = (day + 6) % 7; // Monday = 0
  result.setDate(result.getDate() - diff);
  return result;
};

export const summarizeWeek = (
  entries: FocusHistoryEntry[],
  now: Date = new Date(),
): { totalMinutes: number; sessions: number } => {
  const weekStart = startOfWeek(now).getTime();
  let total = 0;
  let sessions = 0;
  entries.forEach((entry) => {
    if (entry.completedAt >= weekStart) {
      total += entry.durationMinutes;
      sessions += 1;
    }
  });
  return { totalMinutes: total, sessions };
};

export const useFocusHistory = (): {
  entries: FocusHistoryEntry[];
  record: (entry: FocusHistoryEntry) => void;
  clear: () => void;
} => {
  const entries = useSyncExternalStore(subscribe, read, getServerSnapshot);

  const record = useCallback((entry: FocusHistoryEntry) => {
    write([...read(), entry]);
  }, []);

  const clear = useCallback(() => {
    write([]);
  }, []);

  return { entries, record, clear };
};

// Exposed for the customizer Reset flow.
export const clearFocusHistory = (): void => {
  write([]);
};
