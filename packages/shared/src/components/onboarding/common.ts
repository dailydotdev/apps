import React from 'react';
import classed from '../../lib/classed';

export enum OnboardingStep {
  Intro = 'intro',
  Topics = 'topics',
  Layout = 'layout',
  Theme = 'theme',
  EditTag = 'edit_tag',
}

export const OnboardingTitle = classed(
  'h3',
  'text-center typo-title2 font-bold px-4',
);

export const OnboardingGradientClasses =
  'font-bold text-transparent bg-clip-text bg-gradient-to-r from-theme-color-bacon to-theme-color-cabbage';
export const OnboardingTitleGradient = classed('h1', OnboardingGradientClasses);

export interface OnboardingStepProps {
  onClose?: (e: React.MouseEvent | React.KeyboardEvent) => void;
  isModal?: boolean;
}

export const REQUIRED_TAGS_THRESHOLD = 5;

export const wrapperMaxWidth = 'max-w-[75rem] laptopXL:max-w-[90rem]';
