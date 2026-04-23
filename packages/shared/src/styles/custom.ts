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

export const cvUploadBannerBg =
  'linear-gradient(270deg, rgba(239, 213, 200, 0.16) 0%, rgba(210, 233, 227, 0.16) 25.96%, rgba(198, 222, 250, 0.16) 53.37%, rgba(196, 199, 251, 0.16) 79.33%, rgba(199, 182, 250, 0.16) 100%)';

export const recruiterPremiumPlanBg =
  'radial-gradient(76.99% 27.96% at 53.99% 54.97%, #CE3DF3 0%, rgba(114, 41, 240, 0.08) 50%)';

export const profileCompletionCardBorder =
  '1px solid color-mix(in srgb, var(--theme-accent-cabbage-subtler), transparent 50%)';

export const profileCompletionCardBg =
  'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-bolder), transparent 92%) 0%, color-mix(in srgb, var(--theme-accent-cabbage-bolder), transparent 96%) 100%)';

export const profileCompletionButtonBg =
  'color-mix(in srgb, var(--theme-accent-cabbage-default), transparent 20%)';

// Zen wallpaper gradients. Kept here because they live outside the token
// system (pure visual ambience, not semantic) and we want to centralize any
// raw color usage. See `features/newTab/zen/zenWallpapers.ts` for metadata.
export const zenWallpaperGradients = {
  dawn: 'linear-gradient(135deg, #FFC2A1 0%, #FF9EB5 40%, #9F7AEA 100%)',
  noon: 'linear-gradient(135deg, #76D7FF 0%, #3FB6FF 50%, #1A73E8 100%)',
  forest: 'linear-gradient(135deg, #2B5F3B 0%, #4C9B5B 50%, #C5E8AC 100%)',
  sunset: 'linear-gradient(135deg, #FF7B54 0%, #FF3C6A 45%, #9B0F65 100%)',
  night: 'linear-gradient(135deg, #0F1020 0%, #1B1F44 50%, #3B2F6C 100%)',
  aurora: 'linear-gradient(135deg, #0B3A3C 0%, #107878 40%, #39C6B0 100%)',
} as const;
