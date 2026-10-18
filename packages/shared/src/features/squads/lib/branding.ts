import type { CSSProperties } from 'react';
import type { SquadBranding } from '../../../graphql/squadBranding';

// Mirrors of the API's branding validation, and the colour maths for the
// header button: its text turns white or dark, whichever reads better.

export const SQUAD_BUTTON_LABEL_MAX_LENGTH = 24;

export const squadBrandSwatches = [
  '#FF570A',
  '#2D7FF9',
  '#1DDC6F',
  '#EF4B7F',
  '#7147ED',
  '#0E1217',
];

export const squadButtonPresets = [
  'Start free trial',
  'Read the docs',
  'Install the GitHub app',
  'Book a demo',
  'Join our Discord',
];

export const isHexColor = (value?: string | null): value is string =>
  !!value && /^#[0-9a-f]{6}$/i.test(value);

const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: number, b: number): number =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const white = '#FFFFFF';
const dark = '#0E1217';

export interface BrandInk {
  /** The text and icon colour on the brand colour. */
  ink: string;
  /** WCAG contrast ratio of `ink` on the brand colour. */
  ratio: number;
  isDark: boolean;
}

/** White or near-black text, whichever has the higher WCAG contrast. */
export const getBrandInk = (color: string): BrandInk => {
  const background = luminance(color);
  const onWhite = contrast(background, luminance(white));
  const onDark = contrast(background, luminance(dark));

  return onWhite >= onDark
    ? { ink: white, ratio: onWhite, isDark: false }
    : { ink: dark, ratio: onDark, isDark: true };
};

/** The squad's brand colour, if it is set and valid. */
export const getBrandColor = (branding?: SquadBranding | null): string | null =>
  isHexColor(branding?.color) ? branding?.color ?? null : null;

/** The header button styled in the brand colour. */
export const getBrandButtonStyle = (color: string): CSSProperties => ({
  background: color,
  borderColor: color,
  color: getBrandInk(color).ink,
});

/** The wash under the cover: the brand colour fading into the page. */
export const getBrandWashStyle = (color: string): CSSProperties => ({
  background: `linear-gradient(to bottom, color-mix(in srgb, ${color}, transparent 78%), transparent 85%)`,
});
