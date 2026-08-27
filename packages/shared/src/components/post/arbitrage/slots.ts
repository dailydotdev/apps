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
  /** MPU repeated through a long comment thread. */
  commentMpu: 7,
  /** "MPU 1" in the brief: first rail unit, under the source card. */
  railAfterSource: 11,
  /** Second rail unit, after the further reading widget. */
  railBetweenFurtherReading: 12,
  /** MPU repeated through the article body, one per BODY_CHARS_PER_AD. */
  inBodyMpu: 17,
  /** MPU directly above the comment section. */
  aboveCommentsMpu: 18,
  /** Half page closing the rail — the page's only sticky unit. */
  railBottomSticky: 19,
  /**
   * The top leaderboard's phone twin: the same AdSense unit requested at a
   * fixed 320x100. A responsive request can come back as expandable video,
   * which inside the phone-sticky header block pinned half the screen; a
   * fixed-size request can only return its exact size.
   */
  topLeaderboardPhone: 20,
} as const;

/*
 * Slot numbers 1, 3, 4, 5, 6, 8, 9, 10 and 13 are retired rather than reused:
 * the sidebar unit, the MPU beside the cover, the three extra rail units, the
 * two closing multiplex grids, the half-page rail tower and the custom
 * floating leaderboard were all dropped, and their AdSense reporting rows
 * stay readable only while no other placement inherits the number. 15 and 16
 * belong to the organic post page below.
 *
 * The bottom leaderboard is Google's Anchor format now, not a slot in this
 * map: a publisher-implemented sticky is capped at 300px wide and desktop
 * only, while Google's own anchor serves a full-width leaderboard on every
 * breakpoint and renders its own dismiss control — which must never be
 * hidden, styled or covered.
 * TODO(chris): enable "Anchor ads" under Auto ads in the AdSense account,
 * with BOTH preconditions met first:
 * 1. Scope it with an AdSense URL group to /articles only. The script also
 *    loads on /posts/[id] whenever post_adsense is on, so an unscoped
 *    account-level anchor lands on the organic post page too, on top of the
 *    two reviewed units there.
 * 2. Verify the anchor against FooterNavBarLayout's fixed bottom bar on a
 *    real phone before traffic. The custom anchor's offsetByAnchorAd
 *    compensation retired with it; if Google's overlay and the bar collide,
 *    an obscured ad is itself a policy violation.
 */

/**
 * The top leaderboard stays pinned this long while the visitor scrolls, then
 * releases and scrolls away with the page. Partner spec.
 */
export const TOP_LEADERBOARD_STICKY_MS = 10_000;

/**
 * A long thread gets an MPU each time this many comments have gone by —
 * replies included, every comment counts (product call, Aug 25; interval
 * revised 8 → 6 the same day). Short threads stay ad-free.
 */
export const COMMENTS_PER_INTERLEAVED_AD = 6;

/**
 * Visible characters of content between in-content MPUs — 250, per Nick's
 * confirmed spec (characters, not words; re-confirmed Aug 25 after the
 * words reading shipped first). At this cadence density is carried by
 * MAX_CONTENT_ADS_PER_SECTION below, not by the interval.
 */
export const CONTENT_CHARS_PER_AD = 250;

/**
 * Hard cap per section (TLDR, body): 250 characters is ~3 lines of rendered
 * text per 282px unit, so an uncapped long body would be a wall of ads —
 * the exact shape the Better Ads 30% mobile cap and AdSense's low-value
 * policy act on, both of which punish the whole domain. The balanced
 * splitters spread the capped units evenly through the section instead of
 * front-loading them.
 */
export const MAX_CONTENT_ADS_PER_SECTION = 4;

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
  [ARBITRAGE_SLOT.topLeaderboardPhone]: {
    id: '9942870945',
    type: 'display',
    width: 320,
    height: 100,
  },
  // The three MPU placements below share existing Display units while the
  // dedicated ones don't exist: Google's per-unit reporting blends them, but
  // our first-party events split by slot number, so per-placement RPM stays
  // queryable in ClickHouse.
  // TODO(chris): create dedicated Display units (read_s17_in_body,
  // read_s18_above_comments) and swap the ids for clean AdSense-side rows.
  //
  // Phone density, the written gate the previous map kept slot 7 behind:
  // - The comment MPU stays hideOnPhone in the template until a long-thread
  //   phone measurement with the interval live says otherwise.
  // - The in-content MPUs are phone-visible but capped: at the 250-char
  //   cadence the interval no longer bounds density, so
  //   MAX_CONTENT_ADS_PER_SECTION does — see its comment for the math.
  [ARBITRAGE_SLOT.commentMpu]: { id: '6921226982', type: 'display' },
  [ARBITRAGE_SLOT.railAfterSource]: { id: '5249052667', type: 'display' },
  [ARBITRAGE_SLOT.railBetweenFurtherReading]: {
    id: '6921226982',
    type: 'display',
  },
  [ARBITRAGE_SLOT.inBodyMpu]: { id: '6921226982', type: 'display' },
  [ARBITRAGE_SLOT.aboveCommentsMpu]: { id: '5249052667', type: 'display' },
  // read_s10's fixed 300x600, back as the rail's closing unit. Compliant as a
  // publisher sticky: 300px wide, desktop only, and the page's ONLY sticky —
  // AdSense allows exactly one per viewport.
  [ARBITRAGE_SLOT.railBottomSticky]: {
    id: '4307400883',
    type: 'display',
    width: 300,
    height: 600,
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
  /** Rail unit below the direct-sold ad widget. */
  railAfterDirectAd: 16,
  /** The organic leaderboard's fixed 320x100 phone twin — see slot 20. */
  topLeaderboardPhone: 21,
  /** MPU repeated through the TLDR, same cadence as the articles page. */
  inContentMpu: 22,
  /** MPU directly above the comment section. */
  aboveCommentsMpu: 23,
  /** MPU through a long thread, every COMMENTS_PER_INTERLEAVED_AD. */
  commentMpu: 24,
} as const;

// Borrowed /read units so the placements serve before their own exist;
// their reporting blends with the /read rows meanwhile.
// TODO(chris): create post_s15_top_leaderboard and post_s16_rail_mpu
// (Display 300x250) in AdSense and swap the ids for per-placement RPM.
export const ORGANIC_ADSENSE_SLOTS: AdsenseSlots = {
  [ORGANIC_SLOT.topLeaderboard]: { id: '9942870945', type: 'display' },
  [ORGANIC_SLOT.topLeaderboardPhone]: {
    id: '9942870945',
    type: 'display',
    width: 320,
    height: 100,
  },
  [ORGANIC_SLOT.railAfterDirectAd]: { id: '6921226982', type: 'display' },
  // Shared units, same trade as the articles map: Google's per-unit rows
  // blend, first-party events split by slot number.
  [ORGANIC_SLOT.inContentMpu]: { id: '6921226982', type: 'display' },
  [ORGANIC_SLOT.aboveCommentsMpu]: { id: '5249052667', type: 'display' },
  [ORGANIC_SLOT.commentMpu]: { id: '6921226982', type: 'display' },
};
