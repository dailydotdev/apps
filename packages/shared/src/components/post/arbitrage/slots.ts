/**
 * Slot numbers named with the ad partner's own terminology, so the remote
 * config, this code and their placement brief all refer to the same units.
 *
 * IAB names: a "leaderboard" is 728x90, an "MPU" (mid page unit) is the
 * 300x250 / 336x280 rectangle, and a "half page" is 300x600.
 */
import type { ReadAdsenseSlots } from './adsense';

export const ARBITRAGE_SLOT = {
  /** Compact unit pinned below the left sidebar's navigation. */
  sidebar: 1,
  /** Leaderboard above the article. Sticks while scrolling, then releases. */
  topLeaderboard: 2,
  /** Medium rectangle beside the tags, date and cover image. */
  inlineMpu1: 3,
  /** Rail unit after the author card. */
  railAfterCreator: 4,
  /** Rail unit after the share bar. */
  railAfterShare: 5,
  /** Rail unit after the highlights widget. */
  railAfterHighlights: 6,
  /** Native unit, repeated through a long comment thread. */
  commentNative: 7,
  /** Second multiplex grid, directly below the first. */
  endOfArticleGridSecondary: 8,
  /** Multiplex grid closing the page, after the discussion. */
  endOfArticleGrid: 9,
  /** "MPU 2" in the brief: half page, sticky at the bottom of the right rail. */
  railStickyHalfPage: 10,
  /** "MPU 1" in the brief: first rail unit, under the source card. */
  railAfterSource: 11,
  /** Rail unit between the similar posts and the best discussions. */
  railBetweenFurtherReading: 12,
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
 * is just the `post_adsense` boolean; the /read template needs none.
 *
 * A unit's `type` is set when it is created in AdSense and cannot be
 * overridden from here: an in-article unit is fluid whatever the <ins> asks
 * for, which is why slot 3 was answering a 300x250 placement with a 600px
 * tall creative. Where the two disagree the TODO says which unit to recreate.
 */
export const READ_ADSENSE_SLOTS: ReadAdsenseSlots = {
  // TODO(chris): recreate as a Display 200x200 unit. The live one is fixed at
  // 240x400, which is most of the sidebar's height.
  [ARBITRAGE_SLOT.sidebar]: {
    id: '1501379344',
    type: 'display',
    width: 200,
    height: 200,
  },
  [ARBITRAGE_SLOT.topLeaderboard]: { id: '9942870945', type: 'display' },
  // TODO(chris): recreate as a Display 300x250 unit. The live one is
  // in-article, so it is fluid and takes whatever height the creative wants.
  [ARBITRAGE_SLOT.inlineMpu1]: {
    id: '9651332107',
    type: 'display',
    width: 300,
    height: 250,
  },
  // TODO(chris): create the three new rail units (suggested names
  // read_s04_rail_creator, read_s05_rail_share, read_s06_rail_highlights) as
  // Display 300x250. They stay collapsed until their ids are filled in.
  [ARBITRAGE_SLOT.railAfterCreator]: { id: '', type: 'display' },
  [ARBITRAGE_SLOT.railAfterShare]: { id: '', type: 'display' },
  [ARBITRAGE_SLOT.railAfterHighlights]: { id: '', type: 'display' },
  // TODO(chris): layoutKey from the read_s07_comment_native "Get code" snippet
  // (data-ad-layout-key). The slot stays collapsed until it is filled in.
  [ARBITRAGE_SLOT.commentNative]: { id: '', type: 'inFeed', layoutKey: '' },
  // Deliberately the same unit as the first grid: AdSense allows one unit to
  // appear more than once on a page, so the second grid works today.
  // TODO(chris): give it its own Multiplex unit so the two report separately.
  [ARBITRAGE_SLOT.endOfArticleGridSecondary]: {
    id: '4399005427',
    type: 'multiplex',
  },
  [ARBITRAGE_SLOT.endOfArticleGrid]: { id: '4399005427', type: 'multiplex' },
  [ARBITRAGE_SLOT.railStickyHalfPage]: {
    id: '4307400883',
    type: 'display',
    width: 300,
    height: 600,
  },
  [ARBITRAGE_SLOT.railAfterSource]: { id: '5249052667', type: 'display' },
  [ARBITRAGE_SLOT.railBetweenFurtherReading]: {
    id: '6921226982',
    type: 'display',
  },
  // TODO(chris): this is read_s02_leaderboard doing double duty — reporting
  // blends both placements into one row. Create a dedicated read_s13 unit and
  // swap the id to get per-placement RPM back.
  [ARBITRAGE_SLOT.floatingLeaderboard]: { id: '9942870945', type: 'display' },
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
