/**
 * The gold mark is drawn at this height, full stop — no optical normalising.
 * That normalising exists to stop a dozen unrelated wall marks fighting each
 * other, and it works by trading height for width, so it punishes exactly the
 * wide mark-plus-wordmark lockup a paid slot is most likely to supply: the
 * lockup came out shorter than the tallest silhouette beside it, which is the
 * opposite of what the slot is sold as. One known creative in one slot does
 * not need normalising, it needs to be the biggest thing on the row.
 *
 * It is the box height, not the cap height, and a lockup that is all wordmark
 * spends nearly all of that box on letterforms where a mark-plus-wordmark
 * spends it on the mark. Sized for the former: matching the wall's ceiling in
 * height, it still leads the row on width and on being the one slot in
 * colour.
 */
export const GOLD_HEIGHT = 20;
/** The wall's two tiers differ by a hair of ink, not by a wash of opacity. */
export const PREMIUM_CAP = 17;
export const COMMUNITY_CAP = 15;

/**
 * Ceiling for the wall, which the optical sizing knows nothing about: a
 * near-square mark would otherwise take its full optical height and outgrow
 * the 40px row.
 */
export const WALL_MAX_HEIGHT = 20;

/** Fixed box every wall mark is drawn into, and the gap between boxes. */
export const SLOT_WIDTH = 88;
export const SLOT_GAP = 16;

/**
 * The ratio the normalising is calibrated around: a mark of this shape is
 * drawn at exactly the cap. Also the fallback for a creative that arrives
 * without dimensions, which is every one of them until the ad server sends
 * them.
 */
export const REFERENCE_RATIO = 3.5;

/**
 * Logo files run from square marks to 6:1 lockups. Sizing them all to one cap
 * height makes the square ones illegible and lets the long ones dominate, so
 * height is normalised by area instead — every mark gets roughly the same ink
 * — and clamped so nothing blows out the row.
 */
export const opticalHeight = (ratio: number, cap: number): number =>
  Math.round(
    Math.min(
      cap * 1.6,
      Math.max(cap * 0.8, cap * Math.sqrt(REFERENCE_RATIO / ratio)),
    ),
  );

/** Optical height, held down to whatever fits the box and the row. */
export const boxedLogoHeight = (
  ratio: number,
  cap: number,
  maxWidth: number,
  maxHeight: number = Number.POSITIVE_INFINITY,
): number =>
  Math.floor(Math.min(opticalHeight(ratio, cap), maxWidth / ratio, maxHeight));

/**
 * How many fixed-width slots the measured row holds. `null` means "not
 * measured yet" rather than "nothing fits": a row narrower than a single slot
 * cannot have been laid out, and treating that as zero would empty the row
 * with nothing guaranteed to come along and correct it.
 */
export const fittedSlotCount = (
  available: number,
  slotWidth: number = SLOT_WIDTH,
  gap: number = SLOT_GAP,
): number | null => {
  if (available < slotWidth) {
    return null;
  }

  return Math.floor((available + gap) / (slotWidth + gap));
};
