/**
 * WCAG math shared by the glass action bar stories. The bar is a translucent
 * overlay, so every ratio depends on the cover under it: composite first, then
 * measure.
 */
export type Rgb = { r: number; g: number; b: number };

export const parseHex = (value: string): Rgb => ({
  r: parseInt(value.slice(1, 3), 16),
  g: parseInt(value.slice(3, 5), 16),
  b: parseInt(value.slice(5, 7), 16),
});

/**
 * Resolves any CSS colour — including the `color-mix()` and `oklab()` forms the
 * theme variables compute to — by painting one pixel. Lets the audit read the
 * accents off the live pill instead of restating them as hexes.
 */
export const resolveColor = (value: string): Rgb => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Canvas 2D context unavailable — cannot resolve colours');
  }
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return { r, g, b };
};

/**
 * Reads a custom property off `element` and resolves it. Goes through `color` so
 * the browser does the `color-mix()` maths rather than this file.
 */
export const readColorVar = (
  element: Element,
  property: string,
  fallback?: string,
): Rgb => {
  const probe = document.createElement('span');
  probe.style.color = fallback
    ? `var(${property}, ${fallback})`
    : `var(${property})`;
  element.appendChild(probe);
  const resolved = resolveColor(getComputedStyle(probe).color);
  probe.remove();
  return resolved;
};

export const composite = (fg: Rgb, alpha: number, bg: Rgb): Rgb => ({
  r: fg.r * alpha + bg.r * (1 - alpha),
  g: fg.g * alpha + bg.g * (1 - alpha),
  b: fg.b * alpha + bg.b * (1 - alpha),
});

export const relativeLuminance = ({ r, g, b }: Rgb): number => {
  const channel = (raw: number) => {
    const v = raw / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

export const contrastRatio = (a: Rgb, b: Rgb): number => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/** SC 1.4.11 — icons and other non-text UI components. */
export const ICON_THRESHOLD = 3;
/** SC 1.4.3 — the interaction counters are text, so they need more. */
export const TEXT_THRESHOLD = 4.5;
