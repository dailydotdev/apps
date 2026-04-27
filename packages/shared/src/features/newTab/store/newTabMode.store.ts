import { useCallback, useSyncExternalStore } from 'react';
import { mirrorToExtensionStorage } from '../../../lib/extensionStorage';

// The new tab can take on one of two identities. Discover is the classic feed
// and the default; Focus is a commitment session (live timer, scheduled
// blocks, optional site blocking). Zen previously existed but was removed in
// favour of a simpler two-mode mental model — stored 'zen' values fall back
// to 'discover' transparently.
export type NewTabMode = 'focus' | 'discover';

export const NEW_TAB_MODE_STORAGE_KEY = 'newtab:mode';
const LEGACY_FOCUS_MODE_KEY = 'newtab:focus-mode';
const CHANGE_EVENT = 'newtab:mode:changed';

const isNewTabMode = (value: unknown): value is NewTabMode =>
  value === 'focus' || value === 'discover';

const readFromStorage = (): NewTabMode => {
  if (typeof window === 'undefined') {
    return 'discover';
  }
  const raw = window.localStorage.getItem(NEW_TAB_MODE_STORAGE_KEY);
  if (raw === null) {
    return 'discover';
  }
  try {
    const parsed = JSON.parse(raw);
    if (isNewTabMode(parsed)) {
      return parsed;
    }
    // Legacy zen users land on Discover — that's the closest match to "I want
    // the daily.dev feed when I open a tab" once we collapse the modes.
    if (parsed === 'zen') {
      return 'discover';
    }
  } catch {
    // fall through to default
  }
  return 'discover';
};

// Legacy focus-mode users land on Discover (formerly Zen) since Zen has been
// removed. Idempotent: we delete the legacy key once handled, so subsequent
// calls are no-ops.
export const runLegacyMigration = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const raw = window.localStorage.getItem(LEGACY_FOCUS_MODE_KEY);
  if (raw === null) {
    return;
  }
  window.localStorage.removeItem(LEGACY_FOCUS_MODE_KEY);

  if (window.localStorage.getItem(NEW_TAB_MODE_STORAGE_KEY) !== null) {
    return;
  }

  // Either way we want them on Discover — Zen no longer exists.
  window.localStorage.setItem(
    NEW_TAB_MODE_STORAGE_KEY,
    JSON.stringify('discover'),
  );
  mirrorToExtensionStorage(NEW_TAB_MODE_STORAGE_KEY, 'discover');
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
    window.localStorage.setItem(NEW_TAB_MODE_STORAGE_KEY, JSON.stringify(next));
    mirrorToExtensionStorage(NEW_TAB_MODE_STORAGE_KEY, next);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }, []);

  return { mode, setMode };
};
