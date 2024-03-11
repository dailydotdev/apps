import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  OnboardingGradientClasses,
  OnboardingTitleGradient,
} from '../onboarding/common';

interface ClassName {
  title?: string;
  description?: string;
}

interface OnboardingHeadlineProps {
  className?: ClassName;
  isOnboardingCopyV1?: boolean;
}

export function OnboardingHeadline({
  className = {},
  isOnboardingCopyV1 = false,
}: OnboardingHeadlineProps): ReactElement {
  const title = isOnboardingCopyV1 ? (
    <h1 className={classNames('mb-8 font-bold', className?.title)}>
      Personalized feed for{' '}
      <span className={OnboardingGradientClasses}>staying up to date</span>
    </h1>
  ) : (
    <OnboardingTitleGradient className={classNames('mb-4', className?.title)}>
      Where developers suffer together
    </OnboardingTitleGradient>
  );

  return (
    <>
      {title}

      {!isOnboardingCopyV1 && (
        <h2 className={classNames('mb-8', className?.description)}>
          We know how hard it is to be a developer. It doesn&apos;t have to be.
          Personalized news feed, dev community and search, much better than
          what&apos;s out there. Maybe ;)
        </h2>
      )}
    </>
  );
}
