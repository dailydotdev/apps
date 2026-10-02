import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { squadCategoriesPaths, isDevelopment } from '../../lib/constants';
import { withoutLayoutVariantPrefix } from '../../lib/layoutVariant';

export enum ShellRoot {
  Home = 'home',
  Explore = 'explore',
  Squads = 'squads',
  Activity = 'activity',
}

export const rootHref: Record<ShellRoot, string> = {
  [ShellRoot.Home]: '/',
  [ShellRoot.Explore]: '/posts',
  [ShellRoot.Squads]: squadCategoriesPaths.discover,
  [ShellRoot.Activity]: '/notifications',
};

const explorePrefixes = ['/posts', '/search', '/tags', '/sources', '/users'];

// The root that owns a URL is the tab that lights on it and the place back
// goes when there is no history: Home for posts, tags, sources and
// profiles; Squads for squads; Explore for search and the directories.
export const owningRoot = (pathname: string): ShellRoot => {
  const path = withoutLayoutVariantPrefix(pathname ?? '');

  if (path.startsWith('/squads')) {
    return ShellRoot.Squads;
  }
  if (path.startsWith('/notifications')) {
    return ShellRoot.Activity;
  }
  if (path.startsWith('/posts/[id]') || path.startsWith('/posts/')) {
    return ShellRoot.Home;
  }
  if (
    explorePrefixes.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    )
  ) {
    return ShellRoot.Explore;
  }

  return ShellRoot.Home;
};

const homeViews = ['/', '/my-feed', '/following'];
const exploreViews = ['/posts', '/popular', '/upvoted', '/discussed'];

// The views a root tab switches between (its segments and sorts). A tap on
// the lit tab from one of these scrolls or refreshes; from anywhere else it
// returns here.
export const isRootView = (root: ShellRoot, pathname: string): boolean => {
  const path = withoutLayoutVariantPrefix(pathname ?? '');

  switch (root) {
    case ShellRoot.Home:
      return (
        homeViews.includes(path) ||
        path.startsWith('/highlights') ||
        (path.startsWith('/feeds/[slugOrId]') && !path.endsWith('/edit'))
      );
    case ShellRoot.Explore:
      return (
        exploreViews.includes(path) ||
        path.startsWith('/posts/upvoted') ||
        path.startsWith('/posts/discussed') ||
        path.startsWith('/explore')
      );
    case ShellRoot.Squads:
      return path.startsWith(squadCategoriesPaths.discover);
    case ShellRoot.Activity:
      return path === '/notifications';
    default:
      return false;
  }
};

const noClusterPrefixes = [
  '/settings',
  '/feeds/new',
  '/feeds/[slugOrId]/edit',
  '/squads/new',
  '/squads/create',
  '/squads/moderate',
  '/squads/[handle]/edit',
  '/squads/[handle]/manage',
  '/squads/[handle]/moderate',
  '/posts/[id]/edit',
];

// Settings and forms are places you finish, not places you browse from:
// the bar leaves so a half-edited page cannot be abandoned by a tab.
export const hidesCluster = (pathname: string): boolean => {
  const path = withoutLayoutVariantPrefix(pathname ?? '');

  return noClusterPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
};

const isSameSiteReferrer = (): boolean => {
  const referrer = globalThis?.document?.referrer;
  const origin = globalThis?.window?.location.origin;

  if (!referrer) {
    return true;
  }

  try {
    return new URL(referrer).origin === origin;
  } catch {
    return false;
  }
};

// One back for every leaf: the previous entry when it is ours, otherwise
// the root that owns the page, so a deep link always has a way up.
export const useShellBack = (): (() => void) => {
  const router = useRouter();

  return useCallback(() => {
    const canGoBack =
      globalThis?.history?.length > 1 &&
      (isSameSiteReferrer() || isDevelopment);

    if (canGoBack) {
      router.back();
      return;
    }

    router.push(rootHref[owningRoot(router.pathname)]);
  }, [router]);
};
