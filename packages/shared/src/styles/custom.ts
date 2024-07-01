// this file was created to contain all custom temporary colors (outside the guideline)
// and it is ideal to have this file to contain fewer colors as possible
// we should eventually convert the custom colors to be part of the guideline once it is deemed to be used frequently

import colors from './colors';

export const devcardBorder = `color-mix(in srgb, ${colors.salt[90]}, transparent 20%)`;

export const bookmarkProviderListBg =
  'linear-gradient(180deg, var(--theme-actions-bookmark-float) 0%, color-mix(in srgb, var(--theme-accent-bun-bolder), transparent 100%) 100%)';
