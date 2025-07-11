// this file was created to contain all custom temporary colors (outside the guideline)
// and it is ideal to have this file to contain fewer colors as possible
// we should eventually convert the custom colors to be part of the guideline once it is deemed to be used frequently

import colors from './colors';

export const devcardBorder = `color-mix(in srgb, ${colors.salt[90]}, transparent 20%)`;

export const bookmarkProviderListBg =
  'linear-gradient(180deg, var(--theme-actions-bookmark-float) 0%, color-mix(in srgb, var(--theme-accent-bun-bolder), transparent 100%) 100%)';

export const briefCardBorder = '1px solid #EFD5C8';

export const briefCardBg =
  'linear-gradient(180deg, rgba(239, 213, 200, 0.16) 0%, rgba(210, 233, 227, 0.16) 25.96%, rgba(198, 222, 250, 0.16) 53.37%, rgba(196, 199, 251, 0.16) 79.33%, rgba(199, 182, 250, 0.16) 100%)';

export const briefButtonBg =
  'linear-gradient(270deg, #EFD5C8 0%, #D2E9E3 25.96%, #C6DEFA 53.37%, #C4C7FB 79.33%, #C7B6FA 100%)';

export const briefCardBgSecondary =
  'linear-gradient(180deg, #EFD5C8 0%, #D2E9E3 25.96%, #C6DEFA 53.37%, #C4C7FB 79.33%, #C7B6FA 100%)';
