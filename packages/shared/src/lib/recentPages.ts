// What kind of entity the recent page points at, so the sidebar can pick a
// recognizable icon instead of a generic one. Captured at record time from the
// route template (a bare `/<handle>` path can't be classified after the fact).
export type RecentPageType = 'user' | 'source' | 'squad' | 'tag' | 'page';

export type RecentPage = {
  path: string;
  title: string;
  type?: RecentPageType;
  // Avatar/logo captured by the page that already loaded the entity, so the
  // sidebar row renders it without a lookup of its own.
  image?: string;
};

export type RecentPageMeta = Pick<RecentPage, 'image'>;

const STORAGE_KEY = 'dailydev:recentPages';
const MAX_RECENT = 5;

// Tiny external store (localStorage-backed) so the recorder mounted in the
// layout and the reader in the sidebar share one reactive list.
let cache: RecentPage[] | null = null;
const listeners = new Set<() => void>();
// The entity page has its metadata on mount, but the recorder only writes the
// entry once the document title settles, so meta arrives first and waits here.
const pendingMeta = new Map<string, RecentPageMeta>();

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

const persist = (next: RecentPage[]): void => {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota / privacy-mode failures
  }
  listeners.forEach((listener) => listener());
};

export const updateRecentPageMeta = (
  path: string,
  meta: RecentPageMeta,
): void => {
  if (typeof window === 'undefined' || !path || !meta.image) {
    return;
  }

  const current = getRecentPages();
  const index = current.findIndex((page) => page.path === path);
  if (index === -1) {
    pendingMeta.set(path, meta);
    return;
  }

  if (current[index].image === meta.image) {
    return;
  }

  const next = [...current];
  next[index] = { ...next[index], ...meta };
  persist(next);
};

export const recordRecentPage = (entry: RecentPage): void => {
  if (typeof window === 'undefined' || !entry.path || !entry.title) {
    return;
  }

  const current = getRecentPages();
  const head = { ...entry, ...pendingMeta.get(entry.path) };
  pendingMeta.delete(entry.path);
  const next = [
    head,
    ...current.filter((page) => page.path !== entry.path),
  ].slice(0, MAX_RECENT);

  // Skip no-op updates (same head path + title) to avoid needless re-renders
  // when an effect re-fires for the page already at the front.
  const isNoop =
    current.length === next.length &&
    current.every((page, index) => page.path === next[index].path) &&
    current[0]?.title === next[0]?.title &&
    current[0]?.image === next[0]?.image;
  if (isNoop) {
    return;
  }

  persist(next);
};
