import type {
  FormEvent,
  MouseEvent,
  KeyboardEvent,
  ReactElement,
  ComponentProps,
} from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import { MoveToIcon } from '../icons';
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
    const heading = (
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

    if (!onBack) {
      return heading;
    }

    return (
      <div className="relative flex min-h-10 flex-col justify-center">
        <Button
          aria-label="Go back"
          icon={<MoveToIcon size={IconSize.Small} className="rotate-180" />}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
          className="absolute left-0 top-1/2 -translate-y-1/2"
          onClick={onBack}
        />
        {heading}
      </div>
    );
  }

  return (
    <Modal.Header
      className={className}
      kind={ModalHeaderKind.Secondary}
      title={title}
      closeOnPhone
    >
      {onBack && (
        <Button
          aria-label="Go back"
          icon={<MoveToIcon size={IconSize.Small} className="rotate-180" />}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
          className="-ml-2 mr-2 tablet:-ml-4"
          onClick={onBack}
        />
      )}
    </Modal.Header>
  );
}

export default AuthHeader;
