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
