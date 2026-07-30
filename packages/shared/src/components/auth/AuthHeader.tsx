import type {
  FormEvent,
  MouseEvent,
  KeyboardEvent,
  ReactElement,
  ComponentProps,
} from 'react';
import React from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { Modal } from '../modals/common/Modal';
import { ModalHeaderKind } from '../modals/common/types';
import { onboardingHeadlineClasses } from '../onboarding/common';

export interface AuthHeaderProps extends ComponentProps<'h2'> {
  simplified?: boolean;
  /**
   * Post-signup onboarding only: take the funnel's headline scale, so the
   * signup and verify-email screens read as the same flow as the steps that
   * follow them. Deliberately separate from `simplified`, which eleven other
   * surfaces set — including the paid funnel and the recruiter modals.
   */
  onboardingHeadline?: boolean;
  title: string;
  onBack?: (e: MouseEvent | KeyboardEvent | FormEvent) => void;
}

function AuthHeader({
  simplified = false,
  onboardingHeadline = false,
  title,
  className,
  onBack,
  ...attrs
}: AuthHeaderProps): ReactElement {
  if (simplified) {
    return (
      <h2
        {...attrs}
        className={
          onboardingHeadline
            ? onboardingHeadlineClasses
            : 'text-center font-bold text-text-primary typo-title2'
        }
      >
        {title}
      </h2>
    );
  }

  return (
    <Modal.Header
      className={className}
      kind={ModalHeaderKind.Secondary}
      title={title}
    >
      {onBack && (
        <Button
          icon={<ArrowIcon className="-rotate-90" />}
          variant={ButtonVariant.Tertiary}
          className="mr-2"
          onClick={onBack}
        />
      )}
    </Modal.Header>
  );
}

export default AuthHeader;
