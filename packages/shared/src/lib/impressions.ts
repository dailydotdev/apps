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
