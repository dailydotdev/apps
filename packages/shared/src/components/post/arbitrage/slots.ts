/**
 * Slot numbers named with the ad partner's own terminology, so the remote
 * config, this code and their placement brief all refer to the same units.
 *
 * IAB names: a "leaderboard" is 728x90, an "MPU" (mid page unit) is the
 * 300x250 / 336x280 rectangle, and a "half page" is 300x600.
 */
import type { ReadAdsenseSlots } from './adsense';

export const ARBITRAGE_SLOT = {
  /** Sidebar unit in the expanded left rail. */
  sidebar: 1,
  /** Leaderboard above the article. Sticks while scrolling, then releases. */
  topLeaderboard: 2,
  /** Medium rectangle beside the tags, date and cover image. */
  inlineMpu1: 3,
  /** Outstream video. Unplaced: the grid below the thread replaced it. */
  video: 4,
  /** Second in-content MPU. Unplaced, as above. */
  inlineMpu2: 5,
  /** Third in-content MPU. Unplaced, as above. */
  inlineMpu3: 6,
  /** Native unit, repeated through a long comment thread. */
  commentNative: 7,
  /** MPU after the comment thread. Unplaced, as above. */
  commentMpu: 8,
  /** Multiplex grid closing the page, after the discussion. */
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

/**
 * A long thread gets a native unit after every this many comments. Short
 * threads never reach the interval, so they stay entirely ad-free.
 */
export const COMMENTS_PER_INTERLEAVED_AD = 5;

/**
 * The AdSense units behind each slot, keyed by slot number. Deliberately in
 * code rather than remote config: unit ids are public (visible in the page
 * source of any live page) and stable after setup, and as a GrowthBook JSON
 * value they shipped in every boot payload of every surface. The remote side
 * is now just the `read_adsense` / `post_adsense` booleans.
 *
 * Slots 4, 5, 6 and 8 exist in AdSense but are unplaced (see ARBITRAGE_SLOT),
 * so they are not mapped.
 */
export const READ_ADSENSE_SLOTS: ReadAdsenseSlots = {
  [ARBITRAGE_SLOT.sidebar]: {
    id: '1501379344',
    type: 'display',
    width: 240,
    height: 400,
  },
  [ARBITRAGE_SLOT.topLeaderboard]: { id: '9942870945', type: 'display' },
  [ARBITRAGE_SLOT.inlineMpu1]: { id: '9651332107', type: 'inArticle' },
  // TODO(chris): layoutKey from the read_s07_comment_native "Get code" snippet
  // (data-ad-layout-key). The slot stays collapsed until it is filled in.
  [ARBITRAGE_SLOT.commentNative]: { id: '', type: 'inFeed', layoutKey: '' },
  [ARBITRAGE_SLOT.endOfArticle]: { id: '4399005427', type: 'multiplex' },
  [ARBITRAGE_SLOT.railStickyMpu]: {
    id: '4307400883',
    type: 'display',
    width: 300,
    height: 600,
  },
  [ARBITRAGE_SLOT.railMpu1]: { id: '5249052667', type: 'display' },
  [ARBITRAGE_SLOT.railMpu2]: { id: '6921226982', type: 'display' },
  // TODO(chris): unit id for the floating leaderboard (was only ever entered
  // in the retired read_adsense_slots remote config).
  [ARBITRAGE_SLOT.floatingLeaderboard]: { id: '', type: 'display' },
};

/**
 * The organic post page (/posts/[id]) carries two units, gated by the
 * `post_adsense` boolean and hidden from Plus members like the internal ads.
 * Numbered after the /read range so reports never collide.
 */
export const ORGANIC_SLOT = {
  /** Leaderboard above the post content, spanning the page column. */
  topLeaderboard: 15,
  /** Half page closing the widget column, sticky for the rest of the read. */
  railHalfPage: 16,
} as const;

// TODO(chris): create the two organic units in AdSense (suggested names
// post_s15_top_leaderboard, post_s16_rail_half_page) and fill in the ids.
// Both slots stay collapsed until then.
export const ORGANIC_ADSENSE_SLOTS: ReadAdsenseSlots = {
  [ORGANIC_SLOT.topLeaderboard]: { id: '', type: 'display' },
  [ORGANIC_SLOT.railHalfPage]: {
    id: '',
    type: 'display',
    width: 300,
    height: 600,
  },
};
