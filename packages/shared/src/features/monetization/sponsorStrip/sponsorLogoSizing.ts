/** The lead sponsor keeps a little more height than the partner row. */
export const GOLD_HEIGHT = 18;
export const WALL_HEIGHT = 16;

/** Fits wordmarks up to 8:1 at the shared height without shrinking them. */
export const WALL_MAX_WIDTH = 128;
export const SLOT_GAP = 16;

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
  gap: number = SLOT_GAP,
): number => {
  let used = 0;
  const overflow = widths.findIndex((width, index) => {
    used += width + (index ? gap : 0);
    return used > available;
  });

  return overflow === -1 ? widths.length : overflow;
};
