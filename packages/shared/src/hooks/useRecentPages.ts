import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/router';
import type { RecentPage, RecentPageType } from '../lib/recentPages';
import {
  getRecentPages,
  recordRecentPage,
  subscribeRecentPages,
} from '../lib/recentPages';

const EMPTY: RecentPage[] = [];
const getServerSnapshot = (): RecentPage[] => EMPTY;

export const useRecentPages = (): RecentPage[] =>
  useSyncExternalStore(subscribeRecentPages, getRecentPages, getServerSnapshot);

const brandSuffix = /\s*[|·\-–—]\s*daily\.dev\s*$/i;
const cleanTitle = (title: string): string =>
  title.replace(brandSuffix, '').trim();

// Classify by the route template (router.pathname), not the resolved URL — only
// the template distinguishes a user profile (`/[userId]`) from other top-level
// pages like `/jobs`.
const typeForPathname = (pathname: string): RecentPageType => {
  if (pathname === '/[userId]') {
    return 'user';
  }
  if (pathname.startsWith('/sources/')) {
    return 'source';
  }
  if (pathname.startsWith('/squads/')) {
    return 'squad';
  }
  if (pathname.startsWith('/tags/')) {
    return 'tag';
  }
  return 'page';
};

// Records the last visited non-post pages for the v2 Home "Recent" section.
// Individual post permalinks (`/posts/[id]`) are skipped — those belong to
// reading History. Reads document.title after a short delay so the page's
// SEO effect has set it.
export const useRecordRecentPages = (enabled: boolean): void => {
  const router = useRouter();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !router?.events) {
      return undefined;
    }

    let timeoutId: number | undefined;
    const capture = (url: string) => {
      if (router.pathname === '/posts/[id]') {
        return;
      }
      const path = url.split('?')[0].split('#')[0];
      // Only the latest navigation matters — drop any pending capture so
      // rapid navigation doesn't stack timers or record stale titles.
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const title = cleanTitle(document.title);
        if (title) {
          recordRecentPage({
            path,
            title,
            type: typeForPathname(router.pathname),
          });
        }
      }, 250);
    };

    capture(router.asPath);
    router.events.on('routeChangeComplete', capture);
    return () => {
      window.clearTimeout(timeoutId);
      router.events.off('routeChangeComplete', capture);
    };
  }, [enabled, router]);
};
