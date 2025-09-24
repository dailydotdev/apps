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
  PreviewFeed = 'preview_feed',
}

export const OnboardingTitle = classed(
  'h3',
  'text-center typo-title2 font-bold px-4',
);

export const onboardingGradientClasses =
  'font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-bacon-default to-accent-cabbage-default';
export const OnboardingTitleGradient = classed('h1', onboardingGradientClasses);

export const REQUIRED_TAGS_THRESHOLD = 5;

export const wrapperMaxWidth = 'max-w-[75rem] laptopXL:max-w-[90rem]';
