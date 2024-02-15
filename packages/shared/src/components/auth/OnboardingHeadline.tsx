import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { OnboardingTitleGradient } from '../onboarding/common';

interface ClassName {
  title?: string;
  description?: string;
}

interface OnboardingHeadlineProps {
  className?: ClassName;
}

export function OnboardingHeadline({
  className = {},
}: OnboardingHeadlineProps): ReactElement {
  return (
    <>
      <OnboardingTitleGradient className={classNames('mb-4', className?.title)}>
        Where developers suffer together
      </OnboardingTitleGradient>

      <h2 className={classNames('mb-8', className?.description)}>
        We know how hard it is to be a developer. It doesn&apos;t have to be.
        Personalized news feed, dev community and search, much better than
        what&apos;s out there. Maybe ;)
      </h2>
    </>
  );
}
