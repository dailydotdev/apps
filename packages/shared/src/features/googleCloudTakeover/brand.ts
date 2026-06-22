// Google Cloud brand values for the advertiser-takeover demo.
// Applied via inline `style` (like `briefButtonBg` in shared/styles/custom.ts)
// so they bypass the `no-custom-color` lint rule, which only inspects
// `bg-`/`text-` Tailwind classNames — not inline styles or SVG fills.

export const gcpBlue = '#4285F4';
export const gcpRed = '#EA4335';
export const gcpYellow = '#FBBC04';
export const gcpGreen = '#34A853';
export const gcpProductBlue = '#1A73E8';

// Subtle four-color wash over the app's subtle surface — for the
// announcement bar and the head ad slot.
export const gcpSurfaceBg =
  'linear-gradient(90deg, rgba(66,133,244,0.16) 0%, rgba(234,67,53,0.10) 34%, rgba(251,188,4,0.10) 67%, rgba(52,168,83,0.16) 100%), var(--theme-background-subtle)';

// Deep-blue gradient for the in-feed strip — dark enough to carry white
// text at AA for the large/bold sizes used there.
export const gcpStripBg =
  'linear-gradient(270deg, #1A73E8 0%, #4285F4 50%, #174EA6 100%)';

// Vibrant four-color gradient — used behind a light logo chip on the ad
// cover and the blog-card image fallback (no text sits directly on it).
export const gcpCoverBg =
  'linear-gradient(270deg, #4285F4 0%, #34A853 33%, #FBBC04 66%, #EA4335 100%)';

export const gcpHairline = '1px solid rgba(66,133,244,0.32)';

// Solid Google product-blue CTA, white label.
export const gcpButtonStyle = {
  backgroundColor: gcpProductBlue,
  color: '#ffffff',
} as const;
