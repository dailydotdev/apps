import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { Overlay } from '@dailydotdev/shared/src/components/utilities';
import React, { ReactElement } from 'react';
import { OverlayContainer } from './common';

interface EmailSentSectionProps {
  onResend?: (e: React.MouseEvent) => void;
  onCancel?: (e: React.MouseEvent) => void;
}

function EmailSentSection({
  onResend,
  onCancel,
}: EmailSentSectionProps): ReactElement {
  return (
    <OverlayContainer className="mt-6 border-theme-status-warning">
      <Overlay className="bg-overlay-quaternary-bun" />
      <p>
        We sent an email to verify your account. Please check your spam folder
        if you {`don't`} see the email.
      </p>
      <span className="flex flex-row gap-4 mt-4">
        {onResend && (
          <Button
            onClick={onResend}
            buttonSize="xsmall"
            className="w-fit btn-primary"
          >
            Resend
          </Button>
        )}
        {onCancel && (
          <Button
            onClick={onCancel}
            buttonSize="xsmall"
            className="w-fit btn-secondary"
          >
            Cancel Request
          </Button>
        )}
      </span>
    </OverlayContainer>
  );
}

export default EmailSentSection;
