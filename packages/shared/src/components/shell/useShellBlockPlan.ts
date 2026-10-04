import { useRouter } from 'next/router';
import { useActiveFeedNameContext } from '../../contexts/ActiveFeedNameContext';
import { useFeedName } from '../../hooks/feed/useFeedName';
import useActiveNav from '../../hooks/useActiveNav';
import { SharedFeedPage } from '../utilities/common';
import { withoutLayoutVariantPrefix } from '../../lib/layoutVariant';
import { blockRest } from './constants';
import { ShellRoot } from './shellNav';

interface ShellBlockPlan {
  root?: ShellRoot;
  rest: string;
}

const restOf: Record<ShellRoot, string> = {
  [ShellRoot.Home]: blockRest.rootWithRow,
  [ShellRoot.Explore]: blockRest.explore,
  [ShellRoot.Squads]: blockRest.rootWithRow,
  // Activity's filters depend on what the member has; they are not held.
  [ShellRoot.Activity]: blockRest.root,
};

// What the block shows on this route and how tall it rests. Read from the
// route alone, so the server answers the same as the client.
export const useShellBlockPlan = (): ShellBlockPlan => {
  const router = useRouter();
  const { feedName } = useActiveFeedNameContext();
  const activeFeedName = feedName ?? SharedFeedPage.Popular;
  const { isAnyExplore, isSearch } = useFeedName({ feedName: activeFeedName });
  const { squads, notifications, bookmarks } = useActiveNav(activeFeedName);
  const pathname = withoutLayoutVariantPrefix(router?.pathname ?? '');

  const root = (() => {
    if (
      isAnyExplore ||
      ['/popular', '/upvoted', '/discussed'].includes(pathname)
    ) {
      return ShellRoot.Explore;
    }
    if (squads) {
      return ShellRoot.Squads;
    }
    if (notifications) {
      return ShellRoot.Activity;
    }
    if (
      ['/', '/my-feed', '/following'].includes(pathname) ||
      pathname.startsWith('/highlights') ||
      (pathname.startsWith('/feeds/[slugOrId]') && !pathname.endsWith('/edit'))
    ) {
      return ShellRoot.Home;
    }
    return undefined;
  })();

  if (root) {
    return { root, rest: restOf[root] };
  }

  // Search results are a page under Explore: back, the query, Filters,
  // and the field under them.
  if (isSearch) {
    return { rest: blockRest.pageWithField };
  }

  return { rest: bookmarks ? blockRest.pageWithRow : blockRest.page };
};
