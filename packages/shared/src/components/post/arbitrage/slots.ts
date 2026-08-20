/**
 * Slot numbers named with the ad partner's own terminology, so the remote
 * config, this code and their placement brief all refer to the same units.
 *
 * IAB names: a "leaderboard" is 728x90, an "MPU" (mid page unit) is the
 * 300x250 / 336x280 rectangle, and a "half page" is 300x600.
 */
export const ARBITRAGE_SLOT = {
  /** Sidebar unit in the expanded left rail. */
  sidebar: 1,
  /** Leaderboard above the article. Sticks while scrolling, then releases. */
  topLeaderboard: 2,
  /** First in-content MPU, directly under the summary. */
  inlineMpu1: 3,
  /** Outstream video, mid-article. */
  video: 4,
  /** Second in-content MPU. */
  inlineMpu2: 5,
  /** Third in-content MPU, above the discussion. */
  inlineMpu3: 6,
  /** Native unit at the top of the comment thread. */
  commentNative: 7,
  /** MPU after the comment thread. */
  commentMpu: 8,
  /** Rich-media unit at the end of the article. */
  endOfArticle: 9,
  /** "MPU 2" in the brief: half page, sticky at the bottom of the right rail. */
  railStickyMpu: 10,
  /** "MPU 1" in the brief: first rail unit, between page furniture. */
  railMpu1: 11,
  /** Second rail MPU, further down. */
  railMpu2: 12,
  /** Floating leaderboard pinned to the bottom of the viewport. */
  floatingLeaderboard: 13,
} as const;

/**
 * The top leaderboard stays pinned this long while the visitor scrolls, then
 * releases and scrolls away with the page. Partner spec.
 */
export const TOP_LEADERBOARD_STICKY_MS = 10_000;

/** The floating leaderboard loads this long after page load. Partner spec. */
export const FLOATING_LEADERBOARD_DELAY_MS = 10_000;
