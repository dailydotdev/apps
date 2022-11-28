import classed from '../../lib/classed';

export enum OnboardingStep {
  Topics = 'topics',
  Layout = 'layout',
  Theme = 'theme',
}

export const OnboardingTitle = classed(
  'h3',
  'text-center typo-title2 font-bold px-4',
);
