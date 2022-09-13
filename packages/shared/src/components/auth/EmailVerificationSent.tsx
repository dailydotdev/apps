import React, { ReactElement, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import classed from '../../lib/classed';
import { Button } from '../buttons/Button';
import EmailSentIcon from '../../../icons/mail_sent.svg';
import useTimer from '../../hooks/useTimer';
import {
  AuthFlow,
  initializeKratosFlow,
  submitKratosFlow,
} from '../../lib/kratos';
import { disabledRefetch } from '../../lib/func';
import {
  AccountRecoveryParameters,
  getNodeByKey,
  VerificationParams,
} from '../../lib/auth';

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
  const [sentCount, setSentCount] = useState(0);
  const { timer, setTimer, runTimer } = useTimer(() => null, 60);
  runTimer();

  const { data: verification } = useQuery(
    ['verification', sentCount],
    () => initializeKratosFlow(AuthFlow.Verification),
    {
      ...disabledRefetch,
    },
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
        disabled={timer > 0 || isLoading}
        onClick={resend}
      >
        Resend email {timer > 0 && `${timer}s`}
      </Button>
    </div>
  );
}

export default EmailVerificationSent;
