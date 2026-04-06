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

/**
 * Paginates mostUpvotedFeed for swipe onboarding: prefers machine-sourced posts, then
 * fills with the same post types from any source when the strict list is short.
 */
export async function fetchSwipeOnboardingPopularDeck(): Promise<Post[]> {
  const seenIds = new Set<string>();
  const strictPosts: Post[] = [];
  const relaxedPosts: Post[] = [];

  let cursor: string | undefined;
  let pages = 0;

  while (pages < MAX_PAGES) {
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

    for (const { node } of edges) {
      if (seenIds.has(node.id)) {
        continue;
      }
      seenIds.add(node.id);
      if (isSwipeOnboardingEligiblePost(node)) {
        strictPosts.push(node);
      } else if (isSwipeOnboardingRelaxedEligiblePost(node)) {
        relaxedPosts.push(node);
      }
    }

    pages += 1;

    const hasNext = conn?.pageInfo?.hasNextPage === true;
    const endCursor = conn?.pageInfo?.endCursor ?? undefined;

    if (strictPosts.length >= TARGET_STRICT_COUNT || !hasNext || !endCursor) {
      break;
    }
    cursor = endCursor;
  }

  if (strictPosts.length >= STRICT_MIN_BEFORE_RELAXED) {
    return strictPosts.slice(0, MAX_DECK_POSTS);
  }

  const merged = [...strictPosts, ...relaxedPosts];
  return merged.slice(0, MAX_DECK_POSTS);
}
