/**
 * Slot numbers named with the ad partner's own terminology, so the remote
 * config, this code and their placement brief all refer to the same units.
 *
 * IAB names: a "leaderboard" is 728x90, an "MPU" (mid page unit) is the
 * 300x250 / 336x280 rectangle, and a "half page" is 300x600.
 */
import type { AdsenseSlots } from '../../../features/monetization/adsense';

export const ARBITRAGE_SLOT = {
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
  /** "MPU 1" in the brief: first rail unit, under the source card. */
  railAfterSource: 11,
  /** Sticky rail unit after the further reading widget. */
  railBetweenFurtherReading: 12,
} as const;

/*
 * Slot numbers 1, 8, 9, 10 and 13 are retired rather than reused: the sidebar
 * unit, the two closing multiplex grids, the half-page rail tower and the
 * custom floating leaderboard were all dropped, and their AdSense reporting
 * rows stay readable only while no other placement inherits the number.
 *
 * The bottom leaderboard is Google's Anchor format now, not a slot in this
 * map: a publisher-implemented sticky is capped at 300px wide and desktop
 * only, while Google's own anchor serves a full-width leaderboard on every
 * breakpoint and renders its own dismiss control — which must never be
 * hidden, styled or covered.
 * TODO(chris): enable "Anchor ads" under Auto ads in the AdSense account.
 * The script only ever loads on /read and the post page, so anchors cannot
 * appear anywhere else; add URL exclusions in AdSense if the post page
 * should not carry one.
 */

/**
 * The top leaderboard stays pinned this long while the visitor scrolls, then
 * releases and scrolls away with the page. Partner spec.
 */
export const TOP_LEADERBOARD_STICKY_MS = 10_000;

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
export const READ_ADSENSE_SLOTS: AdsenseSlots = {
  [ARBITRAGE_SLOT.topLeaderboard]: { id: '9942870945', type: 'display' },
  // read_s03 (9651332107) is an in-article unit, so it is fluid: it ignored
  // both the shape and an explicit 300x250 on the <ins> and kept answering the
  // placement beside the cover with a card twice the cover's height. Pointing
  // it at a responsive Display unit is what actually binds the shape — at the
  // cost of blending its reporting with the rail unit it borrows.
  // TODO(chris): create a dedicated read_s03 Display unit and swap the id back
  // to get per-placement RPM.
  [ARBITRAGE_SLOT.inlineMpu1]: { id: '6921226982', type: 'display' },
  // TODO(chris): create the three new rail units (suggested names
  // read_s04_rail_creator, read_s05_rail_share, read_s06_rail_highlights) as
  // Display 300x250. They stay collapsed until their ids are filled in.
  [ARBITRAGE_SLOT.railAfterCreator]: { id: '', type: 'display' },
  [ARBITRAGE_SLOT.railAfterShare]: { id: '', type: 'display' },
  [ARBITRAGE_SLOT.railAfterHighlights]: { id: '', type: 'display' },
  // TODO(chris): layoutKey from the read_s07_comment_native "Get code" snippet
  // (data-ad-layout-key). The slot stays collapsed until it is filled in.
  [ARBITRAGE_SLOT.commentNative]: { id: '', type: 'inFeed', layoutKey: '' },
  [ARBITRAGE_SLOT.railAfterSource]: { id: '5249052667', type: 'display' },
  [ARBITRAGE_SLOT.railBetweenFurtherReading]: {
    id: '6921226982',
    type: 'display',
  },
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
export const ORGANIC_ADSENSE_SLOTS: AdsenseSlots = {
  [ORGANIC_SLOT.topLeaderboard]: { id: '', type: 'display' },
  [ORGANIC_SLOT.railHalfPage]: {
    id: '',
    type: 'display',
    width: 300,
    height: 600,
  },
};
