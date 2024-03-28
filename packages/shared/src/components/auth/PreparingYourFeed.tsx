import React, { ReactElement } from 'react';
import classNames from 'classnames';
import LogoIcon from '../../svg/LogoIcon';
import LogoText from '../../svg/LogoText';
import classed from '../../lib/classed';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { Loader } from '../Loader';

interface PreparingYourFeedProps {
  isAnimating: boolean;
}

export const OnboardingContainer = classed(
  'div',
  'flex flex-col overflow-x-hidden items-center min-h-screen w-full h-full max-h-screen flex-1 z-max',
);

export function PreparingYourFeed({
  isAnimating,
}: PreparingYourFeedProps): ReactElement {
  const onboardingAnimation = useFeature(feature.onboardingAnimation);

  if (!onboardingAnimation) {
    return (
      <OnboardingContainer className="justify-center typo-title2">
        <Loader innerClassName="before:border-t-theme-color-cabbage after:border-theme-color-cabbage typo-title2" />
        <span className="ml-3">Building your feed...</span>
      </OnboardingContainer>
    );
  }

  return (
    <OnboardingContainer className="justify-center">
      <span className="mb-10 flex flex-row gap-3">
        <LogoIcon className="w-16" />
        <LogoText className="w-32" />
      </span>
      <span className="flex h-1.5 w-full max-w-[19.125rem] flex-row items-center rounded-12 bg-border-subtlest-tertiary px-0.5">
        <span
          className={classNames(
            'relative flex h-0.5 w-0 flex-row items-center bg-theme-color-cabbage transition-[width] duration-[2500ms]',
            isAnimating && 'w-full',
          )}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.1, 0.7, 1.0, 0.1)',
          }}
        >
          <span className="absolute right-0 h-5 w-5 translate-x-1/2 bg-theme-color-cabbage blur-[10px]" />
        </span>
      </span>
      <span className="mt-3 font-normal text-text-secondary typo-body">
        Preparing your feed...
      </span>
    </OnboardingContainer>
  );
}
