import classed from '../../lib/classed';

export enum OnboardingStep {
  Intro = 'intro',
  Topics = 'topics',
  Layout = 'layout',
  Theme = 'theme',
}

export const OnboardingTitle = classed(
  'h3',
  'text-center typo-title2 font-bold px-4',
);

export interface OnboardingStepProps {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
}
