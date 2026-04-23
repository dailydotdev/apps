import { useCallback, useSyncExternalStore } from 'react';

// The new tab can take on one of three identities. Zen is a calm homepage,
// Focus is a commitment session (Phase 2), Discover is the classic feed.
// Phase 1 only surfaces Zen and Discover in the UI; the focus variant is
// reserved so we don't need a schema migration when it lands.
export type NewTabMode = 'zen' | 'focus' | 'discover';

const STORAGE_KEY = 'newtab:mode';
const LEGACY_FOCUS_MODE_KEY = 'newtab:focus-mode';
const CHANGE_EVENT = 'newtab:mode:changed';

const isNewTabMode = (value: unknown): value is NewTabMode =>
  value === 'zen' || value === 'focus' || value === 'discover';

const readFromStorage = (): NewTabMode => {
  if (typeof window === 'undefined') {
    return 'discover';
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return 'discover';
  }
  try {
    const parsed = JSON.parse(raw);
    if (isNewTabMode(parsed)) {
      return parsed;
    }
  } catch {
    // fall through to default
  }
  return 'discover';
};

// Legacy focus-mode users land on Zen because that's the closest match to
// the old bounded single-column layout they opted into. Idempotent: we
// delete the legacy key once handled, so subsequent calls are no-ops.
export const runLegacyMigration = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const raw = window.localStorage.getItem(LEGACY_FOCUS_MODE_KEY);
  if (raw === null) {
    return;
  }
  window.localStorage.removeItem(LEGACY_FOCUS_MODE_KEY);

  if (window.localStorage.getItem(STORAGE_KEY) !== null) {
    return;
  }

  let next: NewTabMode = 'discover';
  try {
    next = JSON.parse(raw) === true ? 'zen' : 'discover';
  } catch {
    next = 'discover';
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  if (typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
};

// Run once at module load for the common case where the module is imported
// before the user hits the new tab page.
if (typeof window !== 'undefined') {
  runLegacyMigration();
}

const subscribe = (callback: () => void): (() => void) => {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};

const getServerSnapshot = (): NewTabMode => 'discover';

export const useNewTabMode = (): {
  mode: NewTabMode;
  setMode: (mode: NewTabMode) => void;
} => {
  // Called on every render; idempotent since the legacy key is deleted on
  // first success. Runs before useSyncExternalStore's getSnapshot so the
  // returned mode already reflects any migration that happened this tab.
  runLegacyMigration();

  const mode = useSyncExternalStore(
    subscribe,
    readFromStorage,
    getServerSnapshot,
  );

  const setMode = useCallback((next: NewTabMode) => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }, []);

  return { mode, setMode };
};
