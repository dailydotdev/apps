import classed from '../../lib/classed';

export type OnboardingOnClickNext = (
  options?: Partial<{
    clickExtension: boolean;
  }>,
) => void;

export enum OnboardingStep {
  Intro = 'intro',
  Topics = 'topics',
  Theme = 'theme',
  EditTag = 'edit_tag',
  ContentTypes = 'content_types',
  ReadingReminder = 'reading_reminder',
  PWA = 'pwa',
  Plus = 'plus',
  Extension = 'extension',
  InteractiveFeed = 'interactive_feed',
  PreviewFeed = 'preview_feed',
}

export const onboardingStepsWithFooter: Array<OnboardingStep> = [
  OnboardingStep.Intro,
];

export const onboardingStepsWithCTA: Array<OnboardingStep> = [
  OnboardingStep.PWA,
  OnboardingStep.Extension,
];

export const OnboardingTitle = classed(
  'h3',
  'text-center typo-title2 font-bold px-4',
);

export const OnboardingGradientClasses =
  'font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-bacon-default to-accent-cabbage-default';
export const OnboardingTitleGradient = classed('h1', OnboardingGradientClasses);

export const REQUIRED_TAGS_THRESHOLD = 5;

export const wrapperMaxWidth = 'max-w-[75rem] laptopXL:max-w-[90rem]';
