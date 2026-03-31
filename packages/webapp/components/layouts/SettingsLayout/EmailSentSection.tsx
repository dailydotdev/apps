import AlertBanner from '@dailydotdev/shared/src/components/alert/AlertBanner';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

interface EmailSentSectionProps {
  onCancel?: (e: React.MouseEvent) => void;
  className?: string;
  email: string;
}

function EmailSentSection({
  onCancel,
  className,
}: EmailSentSectionProps): ReactElement {
  return (
    <AlertBanner
      className={{
        container: classNames('mt-6 border-status-warning', className),
        overlay: 'bg-overlay-quaternary-bun',
      }}
    >
      <p className="typo-callout" data-testid="email_verification_sent">
        We sent an email to verify your account. Please check your spam folder
        if you {`don't`} see the email.
      </p>
      {onCancel && (
        <span className="mt-4 flex flex-row gap-4">
          <Button
            onClick={onCancel}
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Secondary}
            className="w-fit"
          >
            Cancel Request
          </Button>
        </span>
      )}
    </AlertBanner>
  );
}

export default EmailSentSection;
