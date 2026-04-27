import { useCallback, useSyncExternalStore } from 'react';

// Dev-only override for the `isFirstSession` flag exposed by
// `useCustomizeNewTab`. Lets internal builds flip the brand-new-user welcome
// flow on/off without nuking server actions or faking a fresh user.
//
// Stored in localStorage so the override survives page reloads — important
// because validating the welcome flow inevitably involves refreshing the
// new tab to confirm the overlay re-renders. Missing storage defaults to
// forced ON so QA always lands in the open-sidebar first-session path.
//
// Tree-shaken out of production via the NODE_ENV guard at the consumer
// (`FirstSessionDevToggle`) so this store never ships to real users.

export type FirstSessionOverride = boolean | null;

const STORAGE_KEY = 'newtab:first-session-override';
const CHANGE_EVENT = 'newtab:first-session-override:changed';
const REAL_STATE_VALUE = 'real';

interface SnapshotCache {
  raw: string | null;
  value: FirstSessionOverride;
}

let cache: SnapshotCache = { raw: null, value: true };

const read = (): FirstSessionOverride => {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cache.raw) {
    return cache.value;
  }
  let value: FirstSessionOverride = true;
  if (raw === REAL_STATE_VALUE) {
    value = null;
  } else if (raw === 'true') {
    value = true;
  } else if (raw === 'false') {
    value = false;
  }
  cache = { raw, value };
  return value;
};

const write = (value: FirstSessionOverride): void => {
  if (typeof window === 'undefined') {
    return;
  }
  if (value === null) {
    window.localStorage.setItem(STORAGE_KEY, REAL_STATE_VALUE);
  } else {
    window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
  }
  cache = {
    raw: value === null ? REAL_STATE_VALUE : String(value),
    value,
  };
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

const getServerSnapshot = (): FirstSessionOverride => true;

export interface UseFirstSessionOverride {
  override: FirstSessionOverride;
  setOverride: (next: FirstSessionOverride) => void;
  clearOverride: () => void;
}

export const useFirstSessionOverride = (): UseFirstSessionOverride => {
  const override = useSyncExternalStore(subscribe, read, getServerSnapshot);

  const setOverride = useCallback((next: FirstSessionOverride) => {
    write(next);
  }, []);

  const clearOverride = useCallback(() => {
    write(null);
  }, []);

  return { override, setOverride, clearOverride };
};
