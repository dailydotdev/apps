import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { OnboardingGradientClasses } from '../onboarding/common';
import { Typography } from '../typography/Typography';

interface ClassName {
  pretitle?: string;
  title?: string;
  description?: string;
}

interface OnboardingHeadlineProps {
  pretitle?: string;
  title?: string;
  description?: string;
  className?: ClassName;
}

const defaultTitle = 'Where developers suffer together';
const defaultDescription = `We know how hard it is to be a developer. It doesn't have to be.
        Personalized news feed, dev community and search, much better than
        what's out there. Maybe ;)`;

export function OnboardingHeadline({
  pretitle,
  title = defaultTitle,
  description = defaultDescription,
  className,
}: OnboardingHeadlineProps): ReactElement {
  return (
    <div className="flex flex-col">
      {pretitle && (
        <Typography
          className={classNames(
            'font-bold text-white typo-mega3',
            className?.pretitle,
          )}
        >
          {pretitle}
        </Typography>
      )}
      <Typography
        className={classNames(
          'mb-4',
          OnboardingGradientClasses,
          className?.title,
        )}
      >
        {title}
      </Typography>
      <h2 className={className?.description}>{description}</h2>
    </div>
  );
}
