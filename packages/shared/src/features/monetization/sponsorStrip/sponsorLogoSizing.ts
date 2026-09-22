/** The lead sponsor keeps a little more height than the partner row. */
export const GOLD_HEIGHT = 20;
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

/**
 * Conservatively budget each logo at its maximum width before images load.
 * Return `null` while the measured row cannot hold one maximum-width logo.
 */
export const fittedSlotCount = (
  available: number,
  slotWidth: number = WALL_MAX_WIDTH,
  gap: number = SLOT_GAP,
): number | null => {
  if (available < slotWidth) {
    return null;
  }

  return Math.floor((available + gap) / (slotWidth + gap));
};
