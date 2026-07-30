import classed from '../../lib/classed';

export enum OnboardingStep {
  Intro = 'intro',
  Signup = 'signup',
  Topics = 'topics',
  Theme = 'theme',
  EditTag = 'edit_tag',
  ContentTypes = 'content_types',
  ReadingReminder = 'reading_reminder',
  PWA = 'pwa',
  Plus = 'plus',
  PlusPayment = 'plus_payment',
  PlusSuccess = 'plus_success',
  Extension = 'extension',
}

export const OnboardingTitle = classed(
  'h3',
  'text-center typo-title2 font-bold px-4',
);

/**
 * The headline of a post-signup onboarding step. Every step renders this one so
 * the funnel keeps a single scale, weight and alignment from step to step —
 * before it, the six steps used three different sizes and disagreed on weight.
 * `OnboardingTitle` above is a different, smaller heading still used by the
 * extension-permission and acquisition surfaces; leave it alone.
 */
/**
 * The line under an onboarding headline. One size and colour across every step
 * — the steps used to disagree (Title3 on the extension and CV steps, Body on
 * the PWA one), which read as three different levels of importance for the same
 * kind of copy. Shares the headline's 440px measure so both wrap alike.
 */
export const OnboardingSubheadline = classed(
  'p',
  // `[text-wrap:pretty]`, never `text-balance`: balance equalises line lengths
  // and leaves every line short of the 440px measure, which reads as manual
  // line breaks. Pretty only pulls up a lone trailing word.
  'mx-auto w-full max-w-[27.5rem] text-center text-text-secondary typo-body [text-wrap:pretty]',
);

// 27.5rem is the 440px the CTA rail caps at. Capping the headline to the same
// measure means the title wraps identically on every step, even the ones whose
// content below spreads much wider.
// The color must be the explicit token, not inherited: this repo's `.invert`
// flips a subtree's theme by swapping CSS variables, so on the forced-dark steps
// an inherited color sails through the flip and stays light-theme dark.
//
// Exported as a string as well as a component because the signup and
// verify-email screens render before the funnel mounts, from an `h2` inside
// `AuthHeader` — they need the same scale without changing heading level.
export const onboardingHeadlineClasses =
  'mx-auto w-full max-w-[27.5rem] text-center font-bold text-text-primary typo-title1';

export const OnboardingHeadline = classed('h1', onboardingHeadlineClasses);

export const onboardingGradientClasses =
  'font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-bacon-default to-accent-cabbage-default';
export const OnboardingTitleGradient = classed('h1', onboardingGradientClasses);

export const REQUIRED_TAGS_THRESHOLD = 5;

export const wrapperMaxWidth = 'max-w-[75rem] laptopXL:max-w-[90rem]';
