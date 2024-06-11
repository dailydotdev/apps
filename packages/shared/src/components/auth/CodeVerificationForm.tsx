import React, { ReactElement, useContext, useState } from 'react';
import { formToJson } from '../../lib/form';
import { Button, ButtonVariant } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { CloseModalFunc } from '../modals/common';
import AuthHeader from './AuthHeader';
import { AuthFormProps, AuthModalText } from './common';
import { AuthFlow } from '../../lib/kratos';
import useAccountEmailFlow from '../../hooks/useAccountEmailFlow';
import { AuthEventNames } from '../../lib/auth';
import LogContext from '../../contexts/LogContext';
import AuthForm from './AuthForm';
import { KeyIcon } from '../icons';

interface CodeVerificationFormProps extends AuthFormProps {
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
  simplified,
}: CodeVerificationFormProps): ReactElement {
  const { logEvent } = useContext(LogContext);
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
    logEvent({
      event_name: AuthEventNames.SubmitForgotPassword,
    });
    setHint('');
    const { code } = formToJson<{ code: string }>(e.currentTarget);
    await verifyCode({ code });
  };

  const onSendEmail = async () => {
    logEvent({
      event_name: AuthEventNames.SubmitForgotPassword,
    });
    await sendEmail(initialEmail);
  };

  return (
    <>
      <AuthHeader
        simplified={simplified}
        title="Verification"
        onBack={onBack}
      />
      <AuthForm
        className="flex flex-col items-end px-14 py-8"
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
          hint={hint}
          valid={!hint}
          onChange={() => hint && setHint('')}
          leftIcon={<KeyIcon />}
        />
        <Button className="mt-6" variant={ButtonVariant.Primary} type="submit">
          Verify
        </Button>
        <Button
          className="w-30 mx-auto mt-6"
          variant={ButtonVariant.Secondary}
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
