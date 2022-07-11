import React, { ReactElement } from 'react';
import classed from '../../lib/classed';
import { Button } from '../buttons/Button';
import EmailSentIcon from '../../../icons/mail_sent.svg';

const BodyText = classed(
  'p',
  'typo-body text-theme-label-secondary text-center',
);

interface EmailVerificationSentProps {
  email: string;
}

function EmailVerificationSent({
  email,
}: EmailVerificationSentProps): ReactElement {
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
      <Button className="mt-auto btn-primary">Resend email 12s</Button>
    </div>
  );
}

export default EmailVerificationSent;
