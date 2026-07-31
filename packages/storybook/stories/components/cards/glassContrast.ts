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
