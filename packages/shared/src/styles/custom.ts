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
  'radial-gradient(76.99% 27.96% at 53.99% 54.97%, #BA56E1 0%, rgba(114, 41, 240, 0.08) 50%)';

export const profileCompletionCardBorder =
  '1px solid color-mix(in srgb, var(--theme-accent-cabbage-subtler), transparent 50%)';

export const profileCompletionCardBg =
  'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-bolder), transparent 92%) 0%, color-mix(in srgb, var(--theme-accent-cabbage-bolder), transparent 96%) 100%)';

export const profileCompletionButtonBg =
  'color-mix(in srgb, var(--theme-accent-cabbage-default), transparent 20%)';

// Summer sale: a dusk-to-sunset wash with a retro striped sun. The Plus page
// forces dark theme, so these are tuned against a dark surface only.
export const plusSaleBannerBg =
  'linear-gradient(96deg, #2A1152 0%, #6A2585 34%, #D9534B 72%, #F4A83A 100%)';

export const plusSaleBannerGlow =
  'radial-gradient(60% 120% at 78% 120%, rgba(255, 214, 132, 0.45) 0%, rgba(255, 122, 89, 0) 70%)';

// Keeps the copy legible where it overlaps the bright end of the gradient,
// which on narrow screens reaches under the text.
export const plusSaleBannerScrim =
  'linear-gradient(90deg, rgba(24, 9, 46, 0.88) 0%, rgba(24, 9, 46, 0.62) 45%, rgba(24, 9, 46, 0) 100%)';

export const plusSaleSunBg =
  'linear-gradient(180deg, #FFE9B0 0%, #FFB25C 52%, #F4664B 100%)';

export const plusSaleSunStripes =
  'repeating-linear-gradient(180deg, transparent 0 9px, rgba(42, 17, 82, 0.75) 9px 14px)';

export const plusSaleLabelBg =
  'linear-gradient(90deg, #F4A83A 0%, #E05C4B 100%)';
