import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { Modal } from '../modals/common/Modal';
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
    <Modal.Body
      className={classNames(
        'flex flex-col px-0 pb-0 pt-8',
        className.container,
      )}
    >
      {topIcon}
      {typeof title !== 'string' ? (
        title
      ) : (
        <OnboardingTitle>{title}</OnboardingTitle>
      )}
      {description && (
        <p className="mt-3 px-6 text-center text-text-secondary typo-body">
          {description}
        </p>
      )}
      <div className={classNames('flex-1', className.content)}>{children}</div>
    </Modal.Body>
  );
}

export default OnboardingStep;
