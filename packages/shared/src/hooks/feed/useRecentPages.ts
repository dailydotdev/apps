import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { del as delCache, get as getCache, set as setCache } from 'idb-keyval';

export const RECENT_PAGES_LIMIT = 5;
export const RECENT_PAGES_STORAGE_KEY = 'daily.recentPages';

export type RecentPageKind = 'squad' | 'tag' | 'source' | 'feed' | 'user';

export interface RecentPage {
  path: string;
  title: string;
  kind: RecentPageKind;
  visitedAt: number;
}

type Detector = (
  query: Record<string, string | string[] | undefined>,
  asPath: string,
) => Pick<RecentPage, 'path' | 'title' | 'kind'> | null;

const firstValue = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

// Drop query/hash so e.g. ?openModal=... doesn't fragment a single feed into
// multiple recent entries.
const canonicalize = (asPath: string): string => asPath.split(/[?#]/)[0] ?? '/';

const detectors: Record<string, Detector> = {
  '/squads/[handle]': (query, asPath) => {
    const handle = firstValue(query.handle);
    if (!handle) {
      return null;
    }
    return { path: canonicalize(asPath), title: `s/${handle}`, kind: 'squad' };
  },
  '/tags/[tag]': (query, asPath) => {
    const tag = firstValue(query.tag);
    if (!tag) {
      return null;
    }
    return { path: canonicalize(asPath), title: `#${tag}`, kind: 'tag' };
  },
  '/sources/[source]': (query, asPath) => {
    const source = firstValue(query.source);
    if (!source) {
      return null;
    }
    return { path: canonicalize(asPath), title: source, kind: 'source' };
  },
  '/feeds/[slugOrId]': (query, asPath) => {
    const slugOrId = firstValue(query.slugOrId);
    if (!slugOrId) {
      return null;
    }
    return { path: canonicalize(asPath), title: slugOrId, kind: 'feed' };
  },
  // /[userId] is intentionally NOT detected here: the catch-all route also
  // matches non-existent profiles (404s) and other top-level slugs. User
  // visits are recorded explicitly from ProfileLayout once the profile has
  // resolved successfully — see `useRecordRecentUserVisit`.
};

const detectRecentPage = (
  pathname: string,
  query: Record<string, string | string[] | undefined>,
  asPath: string,
): Pick<RecentPage, 'path' | 'title' | 'kind'> | null => {
  const detector = detectors[pathname];
  if (!detector) {
    return null;
  }
  return detector(query, asPath);
};

const sanitizeStoredPages = (value: unknown): RecentPage[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (entry): entry is RecentPage =>
      !!entry &&
      typeof entry === 'object' &&
      typeof (entry as RecentPage).path === 'string' &&
      typeof (entry as RecentPage).title === 'string' &&
      typeof (entry as RecentPage).kind === 'string' &&
      typeof (entry as RecentPage).visitedAt === 'number',
  );
};

type Listener = (pages: RecentPage[]) => void;

class RecentPagesStore {
  private pages: RecentPage[] = [];

  private listeners = new Set<Listener>();

  private loaded = false;

  private loadPromise: Promise<void> | null = null;

  load(): Promise<void> {
    if (this.loaded) {
      return Promise.resolve();
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }
    this.loadPromise = getCache<RecentPage[]>(RECENT_PAGES_STORAGE_KEY)
      .then((cached) => {
        this.pages = sanitizeStoredPages(cached);
        this.loaded = true;
        this.notify();
      })
      .catch(() => {
        this.loaded = true;
      });
    return this.loadPromise;
  }

  record(entry: Pick<RecentPage, 'path' | 'title' | 'kind'>): void {
    const next: RecentPage[] = [
      { ...entry, visitedAt: Date.now() },
      ...this.pages.filter((page) => page.path !== entry.path),
    ].slice(0, RECENT_PAGES_LIMIT);
    if (
      this.pages.length === next.length &&
      this.pages.every(
        (page, index) =>
          page.path === next[index].path &&
          page.visitedAt === next[index].visitedAt,
      )
    ) {
      return;
    }
    this.pages = next;
    setCache(RECENT_PAGES_STORAGE_KEY, next).catch(() => undefined);
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.pages);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clear(): void {
    if (this.pages.length === 0) {
      return;
    }
    this.pages = [];
    delCache(RECENT_PAGES_STORAGE_KEY).catch(() => undefined);
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.pages));
  }
}

const recentPagesStore = new RecentPagesStore();

export const useRecentPagesTracker = (): void => {
  const router = useRouter();

  useEffect(() => {
    recentPagesStore.load();
  }, []);

  useEffect(() => {
    const entry = detectRecentPage(
      router.pathname,
      router.query,
      router.asPath,
    );
    if (!entry) {
      return;
    }
    recentPagesStore.record(entry);
  }, [router.pathname, router.query, router.asPath]);
};

export const useRecentPages = (): RecentPage[] => {
  const [pages, setPages] = useState<RecentPage[]>([]);

  useEffect(() => {
    recentPagesStore.load();
    return recentPagesStore.subscribe(setPages);
  }, []);

  return pages;
};

// Records a user-profile visit only after the profile has been resolved
// successfully, so we never write 404 paths or other top-level slugs that
// happen to match the /[userId] catch-all.
export const useRecordRecentUserVisit = (
  user: { username?: string | null } | null | undefined,
): void => {
  const router = useRouter();

  useEffect(() => {
    if (!user?.username) {
      return;
    }
    recentPagesStore.load();
    recentPagesStore.record({
      path: canonicalize(router.asPath),
      title: `@${user.username}`,
      kind: 'user',
    });
  }, [router.asPath, user?.username]);
};

export const clearRecentPages = (): void => {
  recentPagesStore.clear();
};
