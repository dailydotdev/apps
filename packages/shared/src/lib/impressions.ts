import type { Post } from '../graphql/posts';

/**
 * Real per-post impressions, or `null` when none are available.
 *
 * `analytics.impressions` is populated on the post detail for the author/team;
 * `views` is the feed-level count. Until the feed exposes a real public count
 * `views` may be absent — callers should render nothing when this returns null
 * (and the whole stat is gated behind the `card_impressions` flag).
 */
export const getPostImpressions = (
  post: Pick<Post, 'views' | 'analytics'>,
): number | null => {
  const value = post.analytics?.impressions ?? post.views;
  return typeof value === 'number' ? value : null;
};
