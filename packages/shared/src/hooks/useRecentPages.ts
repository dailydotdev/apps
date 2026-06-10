import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/router';
import type { RecentPage } from '../lib/recentPages';
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

    const capture = (url: string) => {
      if (router.pathname === '/posts/[id]') {
        return;
      }
      const path = url.split('?')[0].split('#')[0];
      window.setTimeout(() => {
        const title = cleanTitle(document.title);
        if (title) {
          recordRecentPage({ path, title });
        }
      }, 250);
    };

    capture(router.asPath);
    router.events.on('routeChangeComplete', capture);
    return () => {
      router.events.off('routeChangeComplete', capture);
    };
  }, [enabled, router]);
};
