/**
 * Slot numbers named with the ad partner's own terminology, so the remote
 * config, this code and their placement brief all refer to the same units.
 *
 * IAB names: a "leaderboard" is 728x90, an "MPU" (mid page unit) is the
 * 300x250 / 336x280 rectangle, and a "half page" is 300x600.
 */
import type { AdSlots } from '../../../features/monetization/kueez';

export const READ_SLOT = {
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
  /** Half page closing the rail, the page's only sticky unit. */
  railBottomSticky: 19,
  /**
   * The top leaderboard's phone twin, pinned at the top of the screen for the
   * whole visit as PhoneTopAdStrip, outside the column. Booked at a fixed
   * 320x50 rather than offered a range: it is the smallest standard size, so
   * the pinned block takes the least of a phone screen, and a single offered
   * size is the only way to be sure no expandable creative can answer a slot
   * that is permanently on screen.
   */
  topLeaderboardPhone: 20,
} as const;

/*
 * Slot numbers 1, 3, 4, 5, 6, 8, 9, 10 and 13 are retired rather than reused:
 * the sidebar unit, the MPU beside the cover, the three extra rail units, the
 * two closing multiplex grids, the half-page rail tower and the custom
 * floating leaderboard were all dropped, and their reporting rows stay
 * readable only while no other placement inherits the number. 15 and 16
 * belong to the organic post page below.
 *
 * There is no bottom anchor unit. It was Google's Auto ads Anchor format,
 * which retired with AdSense: an anchor now would be a publisher sticky like
 * any other, and this page already spends its one sticky on slot 19.
 */

/**
 * The top leaderboard stays pinned this long while the visitor scrolls, then
 * releases and scrolls away with the page. Partner spec.
 */
export const TOP_LEADERBOARD_STICKY_MS = 10_000;

/**
 * A long thread gets an MPU each time this many comments have gone by,
 * replies included, every comment counts (product call, Aug 25; interval
 * revised 8 to 6 the same day). Short threads stay ad-free.
 */
export const COMMENTS_PER_INTERLEAVED_AD = 6;

/**
 * Visible characters of content between in-content MPUs: 250, per Nick's
 * confirmed spec (characters, not words; re-confirmed Aug 25 after the
 * words reading shipped first). At this cadence density is carried by
 * MAX_CONTENT_ADS_PER_SECTION below, not by the interval.
 */
export const CONTENT_CHARS_PER_AD = 250;

/**
 * Hard cap per section (TLDR, body): 250 characters is ~3 lines of rendered
 * text per 282px unit, so an uncapped long body would be a wall of ads,
 * the exact shape the Better Ads 30% mobile cap acts on, which punishes the
 * whole domain. The balanced splitters spread the capped units evenly
 * through the section instead of front-loading them.
 */
export const MAX_CONTENT_ADS_PER_SECTION = 4;

/**
 * Which slots the /read template runs, and the few that are booked at a fixed
 * size rather than offered their format's range.
 *
 * Deliberately in code rather than remote config: there is one Kueez id pair
 * for all of our display inventory, so nothing here is a secret (it is
 * visible in any live page's bid request), and as a GrowthBook JSON value it
 * shipped in every boot payload of every surface.
 *
 * Phone density, the written gate this map keeps slot 7 behind:
 * - The comment MPU stays hideOnPhone in the template until a long-thread
 *   phone measurement with the interval live says otherwise.
 * - The in-content MPUs are phone-visible but capped: at the 250-char
 *   cadence the interval no longer bounds density, so
 *   MAX_CONTENT_ADS_PER_SECTION does, see its comment for the math.
 */
export const READ_AD_SLOTS: AdSlots = {
  [READ_SLOT.topLeaderboard]: {},
  [READ_SLOT.topLeaderboardPhone]: { sizes: [[320, 50]] },
  [READ_SLOT.commentMpu]: {},
  [READ_SLOT.railAfterSource]: {},
  [READ_SLOT.railBetweenFurtherReading]: {},
  [READ_SLOT.inBodyMpu]: {},
  [READ_SLOT.aboveCommentsMpu]: {},
  // The rail's closing unit. Compliant as a publisher sticky: 300px wide,
  // desktop only, and the page's ONLY sticky.
  [READ_SLOT.railBottomSticky]: { sizes: [[300, 600]] },
};

/**
 * The organic post page (/posts/[id]) carries these units for anonymous
 * visitors only: logged-in users never see them, like the internal ads.
 * Numbered after the /read range so reports never collide.
 */
export const ORGANIC_SLOT = {
  /** Leaderboard above the post content, spanning the page column. */
  topLeaderboard: 15,
  /** Rail unit below the direct-sold ad widget. */
  railAfterDirectAd: 16,
  /** The organic leaderboard's pinned 320x50 phone twin, see slot 20. */
  topLeaderboardPhone: 21,
  /** MPU repeated through the TLDR, same cadence as the articles page. */
  inContentMpu: 22,
  /** MPU directly above the comment section. */
  aboveCommentsMpu: 23,
  /** MPU through a long thread, every COMMENTS_PER_INTERLEAVED_AD. */
  commentMpu: 24,
} as const;

export const ORGANIC_AD_SLOTS: AdSlots = {
  [ORGANIC_SLOT.topLeaderboard]: {},
  [ORGANIC_SLOT.topLeaderboardPhone]: { sizes: [[320, 50]] },
  [ORGANIC_SLOT.railAfterDirectAd]: {},
  [ORGANIC_SLOT.inContentMpu]: {},
  [ORGANIC_SLOT.aboveCommentsMpu]: {},
  [ORGANIC_SLOT.commentMpu]: {},
};
