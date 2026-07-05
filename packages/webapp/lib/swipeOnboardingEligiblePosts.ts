import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { PostType } from '@dailydotdev/shared/src/types';

/** Post types we request for swipe onboarding (no shares, collections, freeform, etc.). */
export const SWIPE_ONBOARDING_FEED_SUPPORTED_TYPES: readonly PostType[] = [
  PostType.Article,
  PostType.VideoYouTube,
  PostType.Poll,
];

const swipeOnboardingEligibleTypes: ReadonlySet<PostType> = new Set(
  SWIPE_ONBOARDING_FEED_SUPPORTED_TYPES,
);

/**
 * Swipe onboarding should only surface publication (machine source) posts — not squads,
 * user sources, collections, shares, or freeform.
 */
export function isSwipeOnboardingEligiblePost(
  post: Pick<Post, 'type' | 'source'>,
): boolean {
  if (!post.source || post.source.type !== SourceType.Machine) {
    return false;
  }
  return swipeOnboardingEligibleTypes.has(post.type);
}

/**
 * Same allowed post types as strict onboarding, any source — used to pad the deck when
 * machine-only results are thin (still excludes types not returned by the feed query).
 */
export function isSwipeOnboardingRelaxedEligiblePost(
  post: Pick<Post, 'type' | 'source'>,
): boolean {
  if (!post.source) {
    return false;
  }
  return swipeOnboardingEligibleTypes.has(post.type);
}
