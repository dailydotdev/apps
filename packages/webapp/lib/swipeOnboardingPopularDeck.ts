import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { MOST_UPVOTED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  isSwipeOnboardingEligiblePost,
  isSwipeOnboardingRelaxedEligiblePost,
  SWIPE_ONBOARDING_FEED_SUPPORTED_TYPES,
} from './swipeOnboardingEligiblePosts';

const PAGE_SIZE = 50;
const MAX_PAGES = 12;
const TARGET_STRICT_COUNT = 40;
/** After paging, if strict (machine) posts are below this, append relaxed same-type posts. */
const STRICT_MIN_BEFORE_RELAXED = 24;
const MAX_DECK_POSTS = 100;

type MostUpvotedFeedResponse = {
  page?: Connection<Post>;
};

type SwipeOnboardingDeckState = {
  seenIds: Set<string>;
  strictPosts: Post[];
  relaxedPosts: Post[];
};

function appendEligiblePosts(
  edges: NonNullable<Connection<Post>['edges']>,
  state: SwipeOnboardingDeckState,
): void {
  edges.reduce((acc, { node }) => {
    if (acc.seenIds.has(node.id)) {
      return acc;
    }

    acc.seenIds.add(node.id);

    if (isSwipeOnboardingEligiblePost(node)) {
      acc.strictPosts.push(node);
      return acc;
    }

    if (isSwipeOnboardingRelaxedEligiblePost(node)) {
      acc.relaxedPosts.push(node);
    }

    return acc;
  }, state);
}

async function collectSwipeOnboardingPosts(
  state: SwipeOnboardingDeckState,
  pages = 0,
  cursor?: string,
): Promise<void> {
  if (pages >= MAX_PAGES) {
    return;
  }

  const data = await gqlClient.request<MostUpvotedFeedResponse>(
    MOST_UPVOTED_FEED_QUERY,
    {
      first: PAGE_SIZE,
      period: 30,
      ...(cursor !== undefined ? { after: cursor } : {}),
      supportedTypes: [...SWIPE_ONBOARDING_FEED_SUPPORTED_TYPES],
    },
  );

  const conn = data.page;
  const edges = conn?.edges ?? [];

  appendEligiblePosts(edges, state);

  const hasNext = conn?.pageInfo?.hasNextPage === true;
  const endCursor = conn?.pageInfo?.endCursor ?? undefined;
  const shouldStop =
    state.strictPosts.length >= TARGET_STRICT_COUNT || !hasNext || !endCursor;

  if (shouldStop) {
    return;
  }

  await collectSwipeOnboardingPosts(state, pages + 1, endCursor);
}

/**
 * Paginates mostUpvotedFeed for swipe onboarding: prefers machine-sourced posts, then
 * fills with the same post types from any source when the strict list is short.
 */
export async function fetchSwipeOnboardingPopularDeck(): Promise<Post[]> {
  const state: SwipeOnboardingDeckState = {
    seenIds: new Set<string>(),
    strictPosts: [],
    relaxedPosts: [],
  };

  await collectSwipeOnboardingPosts(state);

  if (state.strictPosts.length >= STRICT_MIN_BEFORE_RELAXED) {
    return state.strictPosts.slice(0, MAX_DECK_POSTS);
  }

  const merged = [...state.strictPosts, ...state.relaxedPosts];
  return merged.slice(0, MAX_DECK_POSTS);
}
