/**
 * `edge-aura` ships ESM only and paints into a 2D canvas context that jsdom
 * does not implement. The aura is a decorative overlay with no role in any
 * assertion, so tests render nothing in its place.
 */
export const EdgeAura = (): null => null;
