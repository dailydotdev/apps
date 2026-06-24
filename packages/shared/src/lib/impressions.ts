import type { Post } from '../graphql/posts';

/**
 * X/Twitter-style compact number: a decimal only shows while the abbreviated
 * value is < 10 (1.2K, 9.9K, 1.8M) and is dropped once it reaches double digits
 * (12K, 137K, 45M) — so the decimal point isn't displayed at every magnitude.
 * Applied at all resolutions.
 */
export const formatImpressions = (value: number | null): string => {
  if (value == null || !Number.isFinite(value)) {
    return '0';
  }
  if (Math.abs(value) < 1000) {
    return String(Math.round(value));
  }
  const units = ['K', 'M', 'B', 'T'];
  let scaled = value;
  let unit = -1;
  while (Math.abs(scaled) >= 1000 && unit < units.length - 1) {
    scaled /= 1000;
    unit += 1;
  }
  const compact =
    Math.abs(scaled) < 10
      ? (Math.round(scaled * 10) / 10).toFixed(1).replace(/\.0$/, '')
      : String(Math.round(scaled));
  return `${compact}${units[unit]}`;
};

/**
 * MOCK FALLBACK — per-post impressions are only populated in some payloads
 * (`analytics.impressions` on the post detail for authors/team, `views` once
 * the feed exposes it). When a real value is present we always use it; when it
 * is missing we derive a stable, realistic-looking number from the post id
 * purely so the impressions UI can be reviewed on a preview build.
 *
 * @engineer Replace this fallback with the real impressions field once the API
 * exposes it everywhere — keep only the real-value branch.
 */
export const getPostImpressions = (
  post: Pick<Post, 'id' | 'views' | 'analytics'>,
): number => {
  const real = post.analytics?.impressions ?? post.views;
  if (typeof real === 'number' && real > 0) {
    return real;
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
