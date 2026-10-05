import { useRouter } from 'next/router';
import { useActiveFeedNameContext } from '../../contexts/ActiveFeedNameContext';
import useActiveNav from '../../hooks/useActiveNav';
import { SharedFeedPage } from '../utilities/common';
import { blockRest } from './constants';
import { isRootView, ShellRoot } from './shellNav';

interface ShellBlockPlan {
  root?: ShellRoot;
  rest: string;
}

const restOf: Record<ShellRoot, string> = {
  [ShellRoot.Home]: blockRest.rootWithRow,
  [ShellRoot.Explore]: blockRest.root,
  [ShellRoot.Squads]: blockRest.rootWithRow,
  // Activity's filters depend on what the member has; they are not held.
  [ShellRoot.Activity]: blockRest.root,
};

const roots = [
  ShellRoot.Explore,
  ShellRoot.Squads,
  ShellRoot.Activity,
  ShellRoot.Home,
];

// What the block shows on this route and how tall it rests. Read from the
// route alone, so the server answers the same as the client.
export const useShellBlockPlan = (): ShellBlockPlan => {
  const router = useRouter();
  const { feedName } = useActiveFeedNameContext();
  const activeFeedName = feedName ?? SharedFeedPage.Popular;
  const { bookmarks } = useActiveNav(activeFeedName);
  const root = roots.find((candidate) =>
    isRootView(candidate, router?.pathname ?? ''),
  );

  if (root) {
    return { root, rest: restOf[root] };
  }

  return { rest: bookmarks ? blockRest.pageWithRow : blockRest.page };
};
