import React, { ReactElement, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Button } from '../buttons/Button';
import EmailSentIcon from '../../../icons/mail_sent.svg';
import useTimer from '../../hooks/useTimer';
import {
  AuthFlow,
  initializeKratosFlow,
  submitKratosFlow,
} from '../../lib/kratos';
import {
  AccountRecoveryParameters,
  getNodeByKey,
  VerificationParams,
} from '../../lib/auth';
import { SecondaryCenteredBodyText } from '../utilities';

interface EmailVerificationSentProps {
  email: string;
}

function EmailVerificationSent({
  email,
}: EmailVerificationSentProps): ReactElement {
  const [sentCount, setSentCount] = useState(0);
  const { timer, setTimer, runTimer } = useTimer(() => null, 60);
  runTimer();

  const { data: verification } = useQuery(['verification', sentCount], () =>
    initializeKratosFlow(AuthFlow.Verification),
  );

  const { mutateAsync: sendVerification, isLoading } = useMutation(
    (params: VerificationParams) => submitKratosFlow(params),
    {
      onSuccess: () => {
        setTimer(60);
        runTimer();
        setSentCount((value) => value + 1);
      },
    },
  );

  const resend = async () => {
    const { action, nodes } = verification.ui;
    const csrfToken = getNodeByKey('csrf_token', nodes);
    const params: AccountRecoveryParameters = {
      csrf_token: csrfToken.attributes.value,
      email,
      method: 'link',
    };

    await sendVerification({ action, params });
  };

  return (
    <div className="flex flex-col flex-1 justify-center py-8 px-9 w-full">
      <SecondaryCenteredBodyText>
        We just sent an email to:
      </SecondaryCenteredBodyText>
      <SecondaryCenteredBodyText className="mt-4 font-bold text-theme-label-primary">
        {email}
      </SecondaryCenteredBodyText>
      <SecondaryCenteredBodyText className="mt-5">
        Click the link in the email to verify your account. Please check your
        spam folder if you {`don't`} see the email.
      </SecondaryCenteredBodyText>
      <EmailSentIcon className="mt-12 w-full h-48" />
      <SecondaryCenteredBodyText className="my-4">
        Still {`can't`} find the email?
      </SecondaryCenteredBodyText>
      <Button
        className="mt-auto btn-primary"
        disabled={timer > 0 || isLoading}
        onClick={resend}
      >
        Resend email {timer > 0 && `${timer}s`}
      </Button>
    </div>
  );
}

export default EmailVerificationSent;
