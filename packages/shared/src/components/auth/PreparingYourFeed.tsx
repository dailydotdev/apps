import React, { ReactElement } from 'react';
import classNames from 'classnames';
import LogoIcon from '../../svg/LogoIcon';
import LogoText from '../../svg/LogoText';
import classed from '../../lib/classed';

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
  return (
    <OnboardingContainer className="justify-center">
      <span className="mb-10 flex flex-row gap-3">
        <LogoIcon className="w-16" />
        <LogoText className="w-32" />
      </span>
      <span className="flex h-1.5 w-full max-w-[19.125rem] flex-row items-center rounded-12 bg-border-subtlest-tertiary px-0.5">
        <span
          className={classNames(
            'relative flex h-0.5 w-0 flex-row items-center bg-theme-color-cabbage transition-[width] duration-[2000ms] ease-in-out',
            isAnimating && 'w-full',
          )}
        >
          <span className="absolute right-0 h-5 w-5 translate-x-1/2 bg-theme-color-cabbage blur-[10px]" />
        </span>
      </span>
      <span className="mt-3 font-normal text-theme-label-secondary typo-body">
        Preparing your feed...
      </span>
    </OnboardingContainer>
  );
}
