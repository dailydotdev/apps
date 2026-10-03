import { useCallback, useEffect } from 'react';
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

const homeViews = ['/', '/my-feed', '/following'];
const exploreViews = ['/posts', '/popular', '/upvoted', '/discussed'];
const exploreSortPrefixes = [
  '/posts/upvoted',
  '/posts/discussed',
  '/posts/latest',
  '/posts/best-of',
  '/explore',
];

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
        exploreSortPrefixes.some((prefix) => path.startsWith(prefix))
      );
    case ShellRoot.Squads:
      return path.startsWith(squadCategoriesPaths.discover);
    case ShellRoot.Activity:
      return path === '/notifications';
    default:
      return false;
  }
};

const explorePrefixes = ['/posts', '/search', '/tags', '/sources', '/users'];

// The root that owns a URL is the tab that lights on it and the place back
// goes when there is no history: Home for posts and profiles; Squads for
// squads; Explore for search and the tag, source and leaderboard
// directories.
export const owningRoot = (pathname: string): ShellRoot => {
  const path = withoutLayoutVariantPrefix(pathname ?? '');

  if (path.startsWith('/squads')) {
    return ShellRoot.Squads;
  }
  if (path.startsWith('/notifications')) {
    return ShellRoot.Activity;
  }
  if (isRootView(ShellRoot.Explore, path)) {
    return ShellRoot.Explore;
  }
  if (path.startsWith('/posts/')) {
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

const noClusterPrefixes = [
  // You is a menu, not a place to browse from; back is its one way out.
  '/you',
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
  // A job page ends in its own fixed call to action.
  '/jobs/[id]',
];

// Settings and forms are places you finish, not places you browse from:
// the bar leaves so a half-edited page cannot be abandoned by a tab.
export const hidesCluster = (pathname: string): boolean => {
  const path = withoutLayoutVariantPrefix(pathname ?? '');

  return noClusterPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
};

// The in-app route stack: this tab's history entries in order, with a
// pointer at the current one, so a back can skip the entries that belong
// to the same level (every settings page a member walked through) and land
// on the page they came from in one history move: a hierarchical back, as
// iOS Settings and X do, rather than a replay of history. Each entry is
// keyed by the key Next keeps in history.state: a push gets a new key, a
// replace keeps its key and a back or forward returns to one, so the stack
// stays one to one with the browser's history.
const stackKey = 'shell-routes';
const stackLimit = 50;
interface RouteEntry {
  key: string;
  path: string;
}
interface RouteStack {
  routes: RouteEntry[];
  pointer: number;
}

// How the document itself was reached, for the one record made on load.
export type DocumentArrival = 'navigate' | 'reload' | 'back_forward';

const emptyStack = (): RouteStack => ({ routes: [], pointer: -1 });

const readStack = (): RouteStack => {
  try {
    const parsed = JSON.parse(
      globalThis.sessionStorage?.getItem(stackKey) ?? 'null',
    ) as RouteStack | null;
    if (
      parsed &&
      Array.isArray(parsed.routes) &&
      parsed.routes.every((entry) => typeof entry?.key === 'string')
    ) {
      return parsed;
    }
  } catch {
    // fall through to an empty stack
  }
  return emptyStack();
};

const writeStack = (stack: RouteStack) => {
  try {
    globalThis.sessionStorage?.setItem(stackKey, JSON.stringify(stack));
  } catch {
    // private mode: back falls to the fallback
  }
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

const cameFromOutside = (): boolean =>
  !!globalThis?.document?.referrer && !isSameSiteReferrer();

const nearestWithPath = (stack: RouteStack, path: string): number => {
  for (let distance = 1; distance < stack.routes.length; distance += 1) {
    const before = stack.pointer - distance;
    if (stack.routes[before]?.path === path) {
      return before;
    }
    const after = stack.pointer + distance;
    if (stack.routes[after]?.path === path) {
      return after;
    }
  }
  return -1;
};

export const recordShellRoute = (
  pathname: string,
  key: string,
  arrival?: DocumentArrival,
): void => {
  const path = withoutLayoutVariantPrefix(pathname);
  const stack = readStack();
  const entry = { key, path };
  const known = stack.routes.findIndex((route) => route.key === key);

  // A replace keeps its key, a back or forward returns to one.
  if (known !== -1) {
    stack.routes[known] = entry;
    writeStack({ routes: stack.routes, pointer: known });
    return;
  }

  // A loaded document gets a fresh key from Next, so the kind of load says
  // which entry it is: the same one on a reload, a neighbour on a back or
  // forward across documents.
  if (arrival === 'reload' && stack.routes[stack.pointer]) {
    stack.routes[stack.pointer] = entry;
    writeStack(stack);
    return;
  }
  if (arrival === 'back_forward') {
    const at =
      stack.routes[stack.pointer]?.path === path
        ? stack.pointer
        : nearestWithPath(stack, path);
    if (at !== -1) {
      stack.routes[at] = entry;
      writeStack({ routes: stack.routes, pointer: at });
      return;
    }
  }
  // Arriving from another site starts over: what this tab held before is
  // no longer what back leads to.
  if (arrival && cameFromOutside()) {
    writeStack({ routes: [entry], pointer: 0 });
    return;
  }

  const routes = stack.routes
    .slice(0, stack.pointer + 1)
    .concat(entry)
    .slice(-stackLimit);
  writeStack({ routes, pointer: routes.length - 1 });
};

const historyKey = (): string =>
  (globalThis.history?.state as { key?: string } | null)?.key ??
  `${globalThis.location?.pathname}${globalThis.location?.search}`;

const documentArrival = (): DocumentArrival => {
  const [navigation] = (globalThis.performance?.getEntriesByType?.(
    'navigation',
  ) ?? []) as PerformanceNavigationTiming[];

  return navigation?.type === 'reload' || navigation?.type === 'back_forward'
    ? navigation.type
    : 'navigate';
};

export const useShellRouteStack = (): void => {
  const router = useRouter();

  // Once per tab: the router object changes on every route.
  useEffect(() => {
    recordShellRoute(window.location.pathname, historyKey(), documentArrival());
    const onComplete = () =>
      recordShellRoute(window.location.pathname, historyKey());
    router.events.on('routeChangeComplete', onComplete);
    return () => {
      router.events.off('routeChangeComplete', onComplete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export const isSettingsPath = (pathname: string): boolean => {
  const path = withoutLayoutVariantPrefix(pathname ?? '');
  return (
    path.startsWith('/settings') ||
    path.startsWith('/notifications/settings') ||
    (path.startsWith('/feeds/') && path.endsWith('/edit'))
  );
};

// Back past every entry of the current level: the nearest earlier page
// that is not one of them, in one history move so nothing is left to
// replay; the fallback when the stack holds no such page.
export const goBackPast = (
  isSameLevel: (pathname: string) => boolean,
  fallback: () => void,
): string | null => {
  const { routes, pointer } = readStack();
  for (let i = pointer - 1; i >= 0; i -= 1) {
    if (!isSameLevel(routes[i].path)) {
      globalThis.history.go(i - pointer);
      return routes[i].path;
    }
  }
  fallback();
  return null;
};

export const isFeedEditPath = (pathname: string): boolean => {
  const path = withoutLayoutVariantPrefix(pathname ?? '');
  return path.startsWith('/feeds/') && path.endsWith('/edit');
};

// Whether the previous history entry is one of ours. Next keeps the index
// of each client navigation in history.state, which the referrer (set once
// per document) cannot tell after the first in-app move.
export const canGoBackInApp = (): boolean => {
  const { history } = globalThis;
  if (!history || history.length <= 1) {
    return false;
  }
  if (readStack().pointer > 0) {
    return true;
  }
  const idx = (history.state as { idx?: number } | null)?.idx ?? 0;

  return idx > 0 || isSameSiteReferrer() || isDevelopment;
};

// One back for every leaf: the previous entry when it is ours, otherwise
// the root that owns the page, so a deep link always has a way up.
export const useShellBack = (): (() => void) => {
  const router = useRouter();

  return useCallback(() => {
    if (canGoBackInApp()) {
      router.back();
      return;
    }

    router.push(rootHref[owningRoot(router.pathname)]);
  }, [router]);
};
