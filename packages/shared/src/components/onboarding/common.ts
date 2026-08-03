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

export const OnboardingSubheadline = classed(
  'p',
  // Not `text-balance`: it equalises line lengths and leaves every line short
  // of the measure, which reads as manual line breaks.
  'mx-auto w-full max-w-[27.5rem] text-center text-text-secondary typo-body [text-wrap:pretty]',
);

// The colour must be the explicit token: `.invert` flips a subtree's theme by
// swapping CSS variables, so an inherited colour sails through unchanged.
// Exported as a string too, for the `h2` in `AuthHeader`.
export const onboardingHeadlineClasses =
  'mx-auto w-full max-w-[27.5rem] text-center font-bold text-text-primary typo-title1';

export const OnboardingHeadline = classed('h1', onboardingHeadlineClasses);

export const onboardingGradientClasses =
  'font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-bacon-default to-accent-cabbage-default';
export const OnboardingTitleGradient = classed('h1', onboardingGradientClasses);

export const REQUIRED_TAGS_THRESHOLD = 5;

export const wrapperMaxWidth = 'max-w-[75rem] laptopXL:max-w-[90rem]';
