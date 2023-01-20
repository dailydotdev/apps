import React, { ReactElement, useContext, useState } from 'react';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { CloseModalFunc } from '../modals/common';
import AuthModalHeader from './AuthModalHeader';
import { AuthModalText } from './common';
import { AuthFlow } from '../../lib/kratos';
import useAccountEmailFlow from '../../hooks/useAccountEmailFlow';
import { AuthEventNames } from '../../lib/auth';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import AuthForm from './AuthForm';
import KeyIcon from '../icons/Key';

interface CodeVerificationFormProps {
  initialEmail: string;
  initialFlow: string;
  onBack?: CloseModalFunc;
  onSubmit?: () => void;
}

function CodeVerificationForm({
  initialEmail,
  initialFlow,
  onBack,
  onSubmit,
}: CodeVerificationFormProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [hint, setHint] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { sendEmail, verifyCode, resendTimer, isLoading } = useAccountEmailFlow(
    {
      flow: AuthFlow.Recovery,
      flowId: initialFlow,
      onTimerFinished: () => setEmailSent(false),
      onError: setHint,
      onSuccess: () => {
        setEmailSent(true);
      },
      onVerifyCodeSuccess: () => {
        onSubmit();
      },
    },
  );

  const onCodeVerification = async (e) => {
    e.preventDefault();
    trackEvent({
      event_name: AuthEventNames.SubmitForgotPassword,
    });
    setHint('');
    const { code } = formToJson<{ code: string }>(e.currentTarget);
    await verifyCode(code);
  };

  const onSendEmail = async () => {
    trackEvent({
      event_name: AuthEventNames.SubmitForgotPassword,
    });
    await sendEmail(initialEmail);
  };

  return (
    <>
      <AuthModalHeader title="Verification" onBack={onBack} />
      <AuthForm
        className="flex flex-col items-end py-8 px-14"
        onSubmit={onCodeVerification}
        data-testid="recovery_form"
      >
        <AuthModalText className="text-center">
          We just sent the verification code to {initialEmail}
        </AuthModalText>
        <TextField
          className={{ container: 'mt-6 w-full' }}
          name="code"
          type="code"
          inputId="code"
          label="Code"
          hint={hint as string}
          valid={!hint}
          onChange={() => hint && setHint('')}
          leftIcon={<KeyIcon />}
        />
        <Button className="mt-6 bg-theme-color-cabbage" type="submit">
          Verify
        </Button>
        <Button
          className="mx-auto mt-6 btn-secondary w-30"
          tag="a"
          onClick={onSendEmail}
          disabled={emailSent || isLoading}
        >
          {resendTimer === 0 ? 'Resend' : `${resendTimer}s`}
        </Button>
      </AuthForm>
    </>
  );
}

export default CodeVerificationForm;
