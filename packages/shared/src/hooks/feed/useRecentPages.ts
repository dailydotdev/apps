import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { del as delCache, get as getCache, set as setCache } from 'idb-keyval';
import type { Source, Squad } from '../../graphql/sources';
import type { PublicProfile } from '../../lib/user';

export const RECENT_PAGES_LIMIT = 5;
export const RECENT_PAGES_STORAGE_KEY = 'daily.recentPages';

export type RecentPageKind = 'squad' | 'tag' | 'source' | 'feed' | 'user';

export type RecentPageEntity =
  | {
      type: 'squad';
      handle: string;
      image?: string | null;
      name?: string | null;
    }
  | {
      type: 'source';
      handle: string;
      image?: string | null;
      name?: string | null;
    }
  | {
      type: 'user';
      username: string;
      image?: string | null;
      name?: string | null;
    };

export interface RecentPage {
  path: string;
  title: string;
  kind: RecentPageKind;
  visitedAt: number;
  entity?: RecentPageEntity;
}

type RecentPageInput = Pick<RecentPage, 'path' | 'title' | 'kind'> &
  Partial<Pick<RecentPage, 'entity'>>;

type Detector = (
  query: Record<string, string | string[] | undefined>,
  asPath: string,
) => RecentPageInput | null;

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
): RecentPageInput | null => {
  const detector = detectors[pathname];
  if (!detector) {
    return null;
  }
  return detector(query, asPath);
};

const isRecentPageKind = (value: unknown): value is RecentPageKind =>
  value === 'squad' ||
  value === 'tag' ||
  value === 'source' ||
  value === 'feed' ||
  value === 'user';

const sanitizeStoredEntity = (value: unknown): RecentPageEntity | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const entity = value as {
    type?: unknown;
    handle?: unknown;
    username?: unknown;
    image?: unknown;
    name?: unknown;
  };
  if (entity.type === 'user' && typeof entity.username === 'string') {
    return {
      type: 'user',
      username: entity.username,
      image: typeof entity.image === 'string' ? entity.image : undefined,
      name: typeof entity.name === 'string' ? entity.name : undefined,
    };
  }

  if (
    (entity.type === 'squad' || entity.type === 'source') &&
    typeof entity.handle === 'string'
  ) {
    return {
      type: entity.type,
      handle: entity.handle,
      image: typeof entity.image === 'string' ? entity.image : undefined,
      name: typeof entity.name === 'string' ? entity.name : undefined,
    };
  }

  return undefined;
};

// Recent pages should never point to a single post. Earlier versions could
// store `/posts/{id}` under a squad/source entity when a post modal was opened
// on top of that entity's feed (router.asPath is swapped via shallow routing).
// Strip those out on read so legacy entries clear themselves over time.
const isFeedLikePath = (path: string): boolean => !path.startsWith('/posts/');

const sanitizeStoredPages = (value: unknown): RecentPage[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.reduce<RecentPage[]>((pages, entry) => {
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof (entry as RecentPage).path !== 'string' ||
      typeof (entry as RecentPage).title !== 'string' ||
      !isRecentPageKind((entry as RecentPage).kind) ||
      typeof (entry as RecentPage).visitedAt !== 'number' ||
      !isFeedLikePath((entry as RecentPage).path)
    ) {
      return pages;
    }

    pages.push({
      path: (entry as RecentPage).path,
      title: (entry as RecentPage).title,
      kind: (entry as RecentPage).kind,
      visitedAt: (entry as RecentPage).visitedAt,
      entity: sanitizeStoredEntity((entry as RecentPage).entity),
    });
    return pages;
  }, []);
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

  record(entry: RecentPageInput): void {
    const previous = this.pages.find((page) => page.path === entry.path);
    const nextEntry: RecentPage = {
      ...entry,
      title: entry.entity ? entry.title : previous?.title ?? entry.title,
      entity: entry.entity ?? previous?.entity,
      visitedAt: Date.now(),
    };
    const next: RecentPage[] = [
      nextEntry,
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
//
// We intentionally use the canonical entity URL (e.g. `/{username}`) instead
// of `router.asPath`. Opening a post modal on top of an entity page swaps the
// address-bar URL to `/posts/{id}` via shallow routing, and reading
// `router.asPath` here would otherwise persist the post URL under the
// entity's name and icon.
export const useRecordRecentUserVisit = (
  user:
    | (Pick<PublicProfile, 'image' | 'name'> & {
        username?: string | null;
      })
    | null
    | undefined,
): void => {
  useEffect(() => {
    if (!user?.username) {
      return;
    }
    recentPagesStore.load();
    recentPagesStore.record({
      path: `/${user.username}`,
      title: user.name || `@${user.username}`,
      kind: 'user',
      entity: {
        type: 'user',
        username: user.username,
        image: user.image,
        name: user.name,
      },
    });
  }, [user?.image, user?.name, user?.username]);
};

export const useRecordRecentSquadVisit = (
  squad: Pick<Squad, 'handle' | 'image' | 'name'> | null | undefined,
): void => {
  useEffect(() => {
    if (!squad?.handle) {
      return;
    }
    recentPagesStore.load();
    recentPagesStore.record({
      path: `/squads/${squad.handle}`,
      title: squad.name || `s/${squad.handle}`,
      kind: 'squad',
      entity: {
        type: 'squad',
        handle: squad.handle,
        image: squad.image,
        name: squad.name,
      },
    });
  }, [squad?.handle, squad?.image, squad?.name]);
};

export const useRecordRecentSourceVisit = (
  source: Pick<Source, 'handle' | 'image' | 'name'> | null | undefined,
): void => {
  useEffect(() => {
    if (!source?.handle) {
      return;
    }
    recentPagesStore.load();
    recentPagesStore.record({
      path: `/sources/${source.handle}`,
      title: source.name || source.handle,
      kind: 'source',
      entity: {
        type: 'source',
        handle: source.handle,
        image: source.image,
        name: source.name,
      },
    });
  }, [source?.handle, source?.image, source?.name]);
};

export const clearRecentPages = (): void => {
  recentPagesStore.clear();
};
