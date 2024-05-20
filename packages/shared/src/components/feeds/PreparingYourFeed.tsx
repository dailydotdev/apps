import React, { ReactElement } from 'react';
import classed from '../../lib/classed';
import { Loader } from '../Loader';

interface PreparingYourFeedProps {
  text: string;
  isAnimating?: boolean;
}

export const OnboardingContainer = classed(
  'div',
  'flex flex-col overflow-x-hidden items-center min-h-screen w-full h-full max-h-screen flex-1 z-max',
);

export function PreparingYourFeed({
  text,
}: PreparingYourFeedProps): ReactElement {
  return (
    <OnboardingContainer className="justify-center typo-title2">
      <Loader innerClassName="before:border-t-theme-color-cabbage after:border-theme-color-cabbage typo-title2" />
      <span className="ml-3">{text}</span>
    </OnboardingContainer>
  );
}
