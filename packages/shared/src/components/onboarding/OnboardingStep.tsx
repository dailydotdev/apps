import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { OnboardingTitle } from './common';

interface ClassName {
  container?: string;
  content?: string;
}

interface OnboardingStepProps {
  topIcon?: ReactNode;
  title: string | ReactNode;
  description?: string;
  children: ReactNode;
  className?: ClassName;
}

function OnboardingStep({
  topIcon,
  title,
  description,
  children,
  className = {},
}: OnboardingStepProps): ReactElement {
  return (
    <div className={classNames('flex flex-col pt-8', className.container)}>
      {topIcon}
      {typeof title !== 'string' ? (
        title
      ) : (
        <OnboardingTitle>{title}</OnboardingTitle>
      )}
      {description && (
        <p className="px-6 mt-3 text-center text-theme-label-secondary typo-body">
          {description}
        </p>
      )}
      <div className={className.content}>{children}</div>
    </div>
  );
}

export default OnboardingStep;
