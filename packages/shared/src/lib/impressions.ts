import type { Post } from '../graphql/posts';

/**
 * MOCK FALLBACK — the feed does not yet return real per-post impressions
 * (`post.views` is currently empty in the feed payload), so when it is missing
 * we derive a stable, realistic-looking number from the post id purely so the
 * impressions UI can be reviewed on a preview build. When `views` is populated
 * we always use the real value.
 *
 * @engineer Replace this fallback with the real impressions field once the API
 * exposes it on the feed — keep only the `post.views` branch.
 */
export const getPostImpressions = (
  post: Pick<Post, 'id' | 'views'>,
): number => {
  if (typeof post.views === 'number' && post.views > 0) {
    return post.views;
  }

  // Deterministic hash of the id → a stable number in ~100K–3M so each card
  // shows a different realistic value (and it never changes between renders).
  let hash = 0;
  for (let i = 0; i < post.id.length; i += 1) {
    hash = (hash * 131 + post.id.charCodeAt(i)) % 2_900_000;
  }
  // Final multiplicative mix so ids sharing a prefix (e.g. feed slugs) spread
  // out instead of producing near-identical values.
  hash = (hash * 1_000_003) % 2_900_000;
  return 100_000 + hash;
};
