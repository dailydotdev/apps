import React, { ReactElement, useState } from 'react';
import classed from '../../lib/classed';
import { Button } from '../buttons/Button';
import EmailSentIcon from '../../../icons/mail_sent.svg';
import useDebounce from '../../hooks/useDebounce';

const BodyText = classed(
  'p',
  'typo-body text-theme-label-secondary text-center',
);

interface EmailVerificationSentProps {
  email: string;
  onResend: () => unknown;
}

function EmailVerificationSent({
  email,
  onResend,
}: EmailVerificationSentProps): ReactElement {
  const [timer, setTimer] = useState(12);
  const [runTimer, clearTimer] = useDebounce(() => {
    if (timer > 0) {
      setTimer((_timer) => _timer - 1);
      runTimer();
    }

    clearTimer();
  }, 1000);
  runTimer();

  const resend = () => {
    setTimer(12);
    runTimer();
    onResend();
  };

  return (
    <div className="flex flex-col flex-1 justify-center py-8 px-9 w-full">
      <BodyText>We just sent an email to:</BodyText>
      <BodyText className="mt-4 font-bold text-theme-label-primary">
        {email}
      </BodyText>
      <BodyText className="mt-5">
        Click the link in the email to verify your account. Please check your
        spam folder if you {`don't`} see the email.
      </BodyText>
      <EmailSentIcon className="mt-12 w-full h-48" />
      <BodyText className="mt-8">Still {`can't`} find the email?</BodyText>
      <Button
        className="mt-auto btn-primary"
        disabled={timer > 0}
        onClick={resend}
      >
        Resend email {timer > 0 && `${timer}s`}
      </Button>
    </div>
  );
}

export default EmailVerificationSent;
