import AlertContainer from '@dailydotdev/shared/src/components/alert/AlertContainer';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import React, { ReactElement } from 'react';
import { useQuery } from 'react-query';
import classNames from 'classnames';
import useAccountEmailFlow from '@dailydotdev/shared/src/hooks/useAccountEmailFlow';
import { AuthFlow, getKratosSession } from '@dailydotdev/shared/src/lib/kratos';

interface EmailSentSectionProps {
  onCancel?: (e: React.MouseEvent) => void;
  className?: string;
}

function EmailSentSection({
  onCancel,
  className,
}: EmailSentSectionProps): ReactElement {
  const { data } = useQuery(['whoami'], getKratosSession);
  const { sendEmail, resendTimer, isLoading } = useAccountEmailFlow(
    AuthFlow.Verification,
  );

  return (
    <AlertContainer
      className={{
        container: classNames('mt-6 border-theme-status-warning', className),
        overlay: 'bg-overlay-quaternary-bun',
      }}
    >
      <p className="typo-callout" data-testid="email_verification_sent">
        We sent an email to verify your account. Please check your spam folder
        if you {`don't`} see the email.
      </p>
      <span className="flex flex-row gap-4 mt-4">
        <Button
          onClick={() => sendEmail(data?.identity?.traits?.email)}
          buttonSize="xsmall"
          className="w-fit btn-primary"
          disabled={isLoading || resendTimer > 0}
        >
          {resendTimer === 0 ? 'Resend' : `${resendTimer}s`}
        </Button>
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
    </AlertContainer>
  );
}

export default EmailSentSection;
