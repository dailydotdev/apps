// this file was created to contain all custom temporary colors (outside the guideline)
// and it is ideal to have this file to contain fewer colors as possible
// we should eventually convert the custom colors to be part of the guideline once it is deemed to be used frequently

import colors from './colors';

export const feedSurveyBg =
  'color-mix(in srgb, var(--theme-background-default), transparent 8%)';

export const feedSurveyBorder =
  'linear-gradient(180deg, var(--theme-accent-cheese-default) 0%, var(--theme-accent-bacon-default) 50%, var(--theme-accent-onion-default) 100%)';

export const feedSurveyTopBorder =
  'linear-gradient(90deg, var(--theme-accent-cheese-default) 0%, var(--theme-accent-bacon-default) 50%, var(--theme-accent-onion-default) 100%)';

export const devcardBorder = `color-mix(in srgb, ${colors.salt[90]}, transparent 20%)`;

export const bookmarkProviderListBg =
  'linear-gradient(180deg, var(--theme-actions-bookmark-float) 0%, color-mix(in srgb, var(--theme-accent-bun-bolder), transparent 100%) 100%)';
