/** The lead sponsor keeps a little more height than the partner row. */
export const GOLD_HEIGHT = 18;
export const WALL_HEIGHT = 16;

/**
 * Fits wordmarks up to 6:1 at the shared height without shrinking them.
 *
 * Measured over the first 34 advertisers, the median wall mark is 4.6:1
 * (74px at this height) and three quarters are under 5.8:1, so 6:1 only
 * touches the outliers. The earlier 8:1 let a single long lockup run to
 * 128px, almost two medians, and take the row's attention with it.
 */
export const WALL_MAX_WIDTH = 96;

/**
 * The gap between wall marks is clamped, not spread: the row fits as many
 * marks as the minimum allows, then shares the leftover between them up to
 * the maximum, and anything beyond that stays empty at the row's end.
 *
 * At a fixed 16px height the median mark is 74px wide, so the gap has to be
 * of that order for the row to read as separate marks rather than one line
 * of type. On production the gap sat at 16-23px at every width and the wall
 * was four fifths ink; 48 brings that to roughly three fifths. From desktopL
 * the row has room for 16 or more marks, and the gap opens to a mark's own
 * width so the count stops being the thing a reader notices.
 */
export const SLOT_GAP = 48;
export const SLOT_GAP_MAX = 64;
export const WIDE_SLOT_GAP = 64;
export const WIDE_SLOT_GAP_MAX = 80;

/**
 * Below laptop the wall is a few hundred pixels and holds three to five
 * marks; a 48px floor would cost one of them at every tablet width. This
 * pair keeps the tablet count where it is today (gaps there already sit at
 * 25-36px) and only stops the leftover from being spread.
 */
export const NARROW_SLOT_GAP = 24;
export const NARROW_SLOT_GAP_MAX = 40;

/**
 * The wall's own width at two breakpoints, with the rail collapsed and a
 * lead mark in place: laptop (1020px) and desktopL (2156px). Read off the
 * measured wall rather than the viewport: the rail's state and the lead's
 * width both change how much room the row has, and the measurement
 * arrives in the same layout effect as the fit, so no mark is ever mounted
 * against one gap and dropped against another.
 */
export const NARROW_WALL_WIDTH = 660;
export const WIDE_WALL_WIDTH = 1800;

/** The gap pair the row fits with, for the room it measured. */
export const wallGapRange = (
  available: number,
): { min: number; max: number } => {
  if (available >= WIDE_WALL_WIDTH) {
    return { min: WIDE_SLOT_GAP, max: WIDE_SLOT_GAP_MAX };
  }

  if (available >= NARROW_WALL_WIDTH) {
    return { min: SLOT_GAP, max: SLOT_GAP_MAX };
  }

  return { min: NARROW_SLOT_GAP, max: NARROW_SLOT_GAP_MAX };
};

/** Fallback until the logo's intrinsic dimensions have loaded. */
export const REFERENCE_RATIO = 3.5;

/** Only unusually wide marks shrink to stay inside their slot. */
export const boxedLogoHeight = (
  ratio: number,
  height: number,
  maxWidth: number,
): number => Math.min(height, maxWidth / ratio);

export const boxedLogoWidth = (
  ratio: number,
  height: number,
  maxWidth: number,
): number => Math.round(boxedLogoHeight(ratio, height, maxWidth) * ratio);

/** Count only whole logos, including the minimum gap between them. */
export const fittedSlotCount = (
  available: number,
  widths: readonly number[],
  gap: number,
): number => {
  let used = 0;
  const overflow = widths.findIndex((width, index) => {
    used += width + (index ? gap : 0);
    return used > available;
  });

  return overflow === -1 ? widths.length : overflow;
};

/**
 * The gap the fitted marks actually get: the row's spare width shared
 * between them, held between the minimum they were fitted with and the
 * maximum past which the marks would float apart.
 *
 * Floored, never rounded: `available` is a fractional rect width, and
 * rounding a .5 up would push the row past it and clip the last mark,
 * whose impression would already have been logged.
 */
export const wallGap = (
  available: number,
  widths: readonly number[],
  min: number,
  max: number,
): number => {
  if (widths.length < 2) {
    return min;
  }

  const ink = widths.reduce((sum, width) => sum + width, 0);
  const spread = (available - ink) / (widths.length - 1);

  return Math.floor(Math.min(max, Math.max(min, spread)));
};
