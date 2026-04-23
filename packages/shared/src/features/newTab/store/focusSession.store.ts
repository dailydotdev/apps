import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { mirrorToExtensionStorage } from '../../../lib/extensionStorage';

export const FOCUS_SESSION_PRESETS_MIN = [25, 50, 90] as const;
export type FocusSessionPreset = (typeof FOCUS_SESSION_PRESETS_MIN)[number];

const DEFAULT_DURATION_MIN: FocusSessionPreset = 25;

export interface FocusSession {
  // Epoch ms when the user started the session (or when resuming — see
  // `pausedElapsedMs`). Null when no session is active.
  startedAt: number | null;
  // Total planned duration in minutes.
  durationMinutes: number;
  // When paused, the timer snapshot in ms so resume continues from where we
  // left off. Null when the timer is running.
  pausedAt: number | null;
  // Accumulated elapsed time carried over from earlier paused segments.
  pausedElapsedMs: number;
  // True once the user has completed the session (reached 0). Lets the UI
  // render the recap without keeping the countdown mounted.
  completedAt: number | null;
}

const DEFAULT_SESSION: FocusSession = {
  startedAt: null,
  durationMinutes: DEFAULT_DURATION_MIN,
  pausedAt: null,
  pausedElapsedMs: 0,
  completedAt: null,
};

const SESSION_KEY = 'newtab:focus-session';
const SETTINGS_KEY = 'newtab:focus-settings';
const SESSION_CHANGE_EVENT = 'newtab:focus-session:changed';
const SETTINGS_CHANGE_EVENT = 'newtab:focus-settings:changed';

export interface FocusSettings {
  defaultDurationMinutes: number;
  escapeFriction: boolean;
}

const DEFAULT_SETTINGS: FocusSettings = {
  defaultDurationMinutes: DEFAULT_DURATION_MIN,
  escapeFriction: true,
};

// Cache parsed snapshots per storage key so `useSyncExternalStore` keeps a
// stable reference across reads. Without the cache, each read() would return
// a fresh object identity and React loops on store-change detection.
interface SnapshotCache<T> {
  raw: string | null;
  value: T;
}

const snapshotCache: Record<string, SnapshotCache<unknown>> = {};

const readJson = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const raw = window.localStorage.getItem(key);
  const cached = snapshotCache[key] as SnapshotCache<T> | undefined;
  if (cached && cached.raw === raw) {
    return cached.value;
  }
  let value = fallback;
  if (raw) {
    try {
      value = { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
    } catch {
      value = fallback;
    }
  }
  snapshotCache[key] = { raw, value };
  return value;
};

const writeJson = <T>(key: string, value: T, eventName: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const raw = JSON.stringify(value);
  window.localStorage.setItem(key, raw);
  snapshotCache[key] = { raw, value };
  // Mirror into extension storage so the background service worker — which
  // has no access to window.localStorage — can make focus-aware decisions
  // (blocklist enforcement, companion suppression, etc.).
  mirrorToExtensionStorage(key, value);
  window.dispatchEvent(new CustomEvent(eventName));
};

const readSession = (): FocusSession => readJson(SESSION_KEY, DEFAULT_SESSION);
const readSettings = (): FocusSettings =>
  readJson(SETTINGS_KEY, DEFAULT_SETTINGS);

const subscribeToSession = (cb: () => void): (() => void) => {
  window.addEventListener(SESSION_CHANGE_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(SESSION_CHANGE_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
};

const subscribeToSettings = (cb: () => void): (() => void) => {
  window.addEventListener(SETTINGS_CHANGE_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(SETTINGS_CHANGE_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
};

const getServerSession = (): FocusSession => DEFAULT_SESSION;
const getServerSettings = (): FocusSettings => DEFAULT_SETTINGS;

// Compute the elapsed time for a session across paused segments. Pure so we
// can unit-test without mocking timers.
export const getElapsedMs = (
  session: FocusSession,
  now: number = Date.now(),
): number => {
  if (session.startedAt === null) {
    return 0;
  }
  if (session.pausedAt !== null) {
    return session.pausedElapsedMs;
  }
  return session.pausedElapsedMs + (now - session.startedAt);
};

export const getRemainingMs = (
  session: FocusSession,
  now: number = Date.now(),
): number => {
  const total = session.durationMinutes * 60_000;
  return Math.max(0, total - getElapsedMs(session, now));
};

export const isSessionActive = (session: FocusSession): boolean =>
  session.startedAt !== null && session.completedAt === null;

export const isSessionPaused = (session: FocusSession): boolean =>
  session.pausedAt !== null && session.completedAt === null;

export const useFocusSession = (): {
  session: FocusSession;
  start: (durationMinutes?: number) => void;
  pause: () => void;
  resume: () => void;
  end: () => void;
  complete: () => void;
  reset: () => void;
} => {
  const session = useSyncExternalStore(
    subscribeToSession,
    readSession,
    getServerSession,
  );

  const start = useCallback((durationMinutes?: number) => {
    const settings = readSettings();
    const next: FocusSession = {
      startedAt: Date.now(),
      durationMinutes: durationMinutes ?? settings.defaultDurationMinutes,
      pausedAt: null,
      pausedElapsedMs: 0,
      completedAt: null,
    };
    writeJson(SESSION_KEY, next, SESSION_CHANGE_EVENT);
  }, []);

  const pause = useCallback(() => {
    const current = readSession();
    if (!isSessionActive(current) || isSessionPaused(current)) {
      return;
    }
    const elapsed = getElapsedMs(current);
    const next: FocusSession = {
      ...current,
      pausedAt: Date.now(),
      pausedElapsedMs: elapsed,
    };
    writeJson(SESSION_KEY, next, SESSION_CHANGE_EVENT);
  }, []);

  const resume = useCallback(() => {
    const current = readSession();
    if (!isSessionPaused(current)) {
      return;
    }
    const next: FocusSession = {
      ...current,
      startedAt: Date.now(),
      pausedAt: null,
    };
    writeJson(SESSION_KEY, next, SESSION_CHANGE_EVENT);
  }, []);

  const end = useCallback(() => {
    writeJson(SESSION_KEY, DEFAULT_SESSION, SESSION_CHANGE_EVENT);
  }, []);

  const complete = useCallback(() => {
    const current = readSession();
    if (!isSessionActive(current)) {
      return;
    }
    const next: FocusSession = {
      ...current,
      completedAt: Date.now(),
      pausedAt: null,
    };
    writeJson(SESSION_KEY, next, SESSION_CHANGE_EVENT);
  }, []);

  const reset = useCallback(() => {
    writeJson(SESSION_KEY, DEFAULT_SESSION, SESSION_CHANGE_EVENT);
  }, []);

  return { session, start, pause, resume, end, complete, reset };
};

export const useFocusSettings = (): {
  settings: FocusSettings;
  setDefaultDuration: (minutes: number) => void;
  setEscapeFriction: (enabled: boolean) => void;
} => {
  const settings = useSyncExternalStore(
    subscribeToSettings,
    readSettings,
    getServerSettings,
  );

  const setDefaultDuration = useCallback((minutes: number) => {
    const current = readSettings();
    writeJson(
      SETTINGS_KEY,
      { ...current, defaultDurationMinutes: minutes },
      SETTINGS_CHANGE_EVENT,
    );
  }, []);

  const setEscapeFriction = useCallback((enabled: boolean) => {
    const current = readSettings();
    writeJson(
      SETTINGS_KEY,
      { ...current, escapeFriction: enabled },
      SETTINGS_CHANGE_EVENT,
    );
  }, []);

  return { settings, setDefaultDuration, setEscapeFriction };
};

// A lightweight ticker hook for components that render the countdown. Updates
// once a second while a session is active and unpaused; stays idle otherwise
// so we don't burn CPU on every new-tab impression.
export const useFocusTick = (session: FocusSession): number => {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!isSessionActive(session) || isSessionPaused(session)) {
      return undefined;
    }
    const id = window.setInterval(() => {
      tick((value) => value + 1);
    }, 1_000);
    return () => window.clearInterval(id);
  }, [session]);
  return getRemainingMs(session);
};
