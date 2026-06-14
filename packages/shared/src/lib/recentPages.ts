export type RecentPage = {
  path: string;
  title: string;
};

const STORAGE_KEY = 'dailydev:recentPages';
const MAX_RECENT = 5;

// Tiny external store (localStorage-backed) so the recorder mounted in the
// layout and the reader in the sidebar share one reactive list.
let cache: RecentPage[] | null = null;
const listeners = new Set<() => void>();

const readStorage = (): RecentPage[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is RecentPage =>
        !!item &&
        typeof item.path === 'string' &&
        typeof item.title === 'string',
    );
  } catch {
    return [];
  }
};

export const getRecentPages = (): RecentPage[] => {
  if (cache === null) {
    cache = readStorage();
  }
  return cache;
};

export const subscribeRecentPages = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const recordRecentPage = (entry: RecentPage): void => {
  if (typeof window === 'undefined' || !entry.path || !entry.title) {
    return;
  }

  const current = getRecentPages();
  const next = [
    entry,
    ...current.filter((page) => page.path !== entry.path),
  ].slice(0, MAX_RECENT);

  // Skip no-op updates (same head path + title) to avoid needless re-renders
  // when an effect re-fires for the page already at the front.
  const isNoop =
    current.length === next.length &&
    current.every((page, index) => page.path === next[index].path) &&
    current[0]?.title === next[0]?.title;
  if (isNoop) {
    return;
  }

  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota / privacy-mode failures
  }
  listeners.forEach((listener) => listener());
};
