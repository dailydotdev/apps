import { useCallback, useSyncExternalStore } from 'react';

// Per-module visibility toggles for the Zen homepage. Kept deliberately
// non-server-synced for Phase 2: Zen is fast and offline-first, and user
// preferences here should never block first paint.
export interface ZenModuleToggles {
  intention: boolean;
  todos: boolean;
  mustReads: boolean;
  quote: boolean;
  wallpaper: boolean;
  shortcuts: boolean;
  weather: boolean;
}

const DEFAULT_TOGGLES: ZenModuleToggles = {
  // The briefing (feed) and shortcuts are the product-native core of Zen.
  // Everything else — including the gradient wallpaper — is an optional
  // accent the user opts in to. Keeping wallpaper off by default means
  // Zen lands on the clean neutral background (calm, content-first) rather
  // than a loud ambient gradient that can feel jarring on first visit.
  mustReads: true,
  shortcuts: true,
  wallpaper: false,
  intention: false,
  todos: false,
  quote: false,
  weather: false,
};

const STORAGE_KEY = 'newtab:zen:modules';
const CHANGE_EVENT = 'newtab:zen:modules:changed';

// Cache the parsed snapshot so `useSyncExternalStore` keeps referential
// equality across reads — otherwise every render trips the store-change
// check and React loops.
let cachedRaw: string | null = null;
let cachedValue: ZenModuleToggles = DEFAULT_TOGGLES;

const read = (): ZenModuleToggles => {
  if (typeof window === 'undefined') {
    return DEFAULT_TOGGLES;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedValue;
  }
  let value = DEFAULT_TOGGLES;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<ZenModuleToggles>;
      value = { ...DEFAULT_TOGGLES, ...parsed };
    } catch {
      value = DEFAULT_TOGGLES;
    }
  }
  cachedRaw = raw;
  cachedValue = value;
  return value;
};

const write = (value: ZenModuleToggles): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const raw = JSON.stringify(value);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedValue = value;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

const subscribe = (callback: () => void): (() => void) => {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};

const getServerSnapshot = (): ZenModuleToggles => DEFAULT_TOGGLES;

export const useZenModules = (): {
  toggles: ZenModuleToggles;
  setToggle: <K extends keyof ZenModuleToggles>(
    module: K,
    value: ZenModuleToggles[K],
  ) => void;
  reset: () => void;
} => {
  const toggles = useSyncExternalStore(subscribe, read, getServerSnapshot);

  const setToggle = useCallback(
    <K extends keyof ZenModuleToggles>(
      module: K,
      value: ZenModuleToggles[K],
    ) => {
      const current = read();
      write({ ...current, [module]: value });
    },
    [],
  );

  const reset = useCallback(() => {
    write(DEFAULT_TOGGLES);
  }, []);

  return { toggles, setToggle, reset };
};

export const resetZenModulesForReset = (): void => {
  write(DEFAULT_TOGGLES);
};
