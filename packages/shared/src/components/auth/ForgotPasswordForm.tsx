import React, { FormEvent, ReactElement, useContext, useState } from 'react';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import { CloseModalFunc } from '../modals/common';
import AuthModalHeader from './AuthModalHeader';
import { AuthModalText } from './common';
import TokenInput from './TokenField';
import { AuthFlow } from '../../lib/kratos';
import useAccountEmailFlow from '../../hooks/useAccountEmailFlow';
import { AuthEventNames } from '../../lib/auth';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import AuthForm from './AuthForm';

interface ForgotPasswordFormProps {
  initialEmail?: string;
  onBack?: CloseModalFunc;
  onSubmit?: (email: string, flow: string) => void;
}

function ForgotPasswordForm({
  initialEmail,
  onBack,
  onSubmit,
}: ForgotPasswordFormProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [hint, setHint] = useState('');
  const { sendEmail, isLoading, token } = useAccountEmailFlow({
    flow: AuthFlow.Recovery,
    onError: setHint,
    onSuccess: onSubmit,
  });

  const onSendEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    trackEvent({
      event_name: AuthEventNames.SubmitForgotPassword,
    });
    const { email } = formToJson<{ email: string }>(e.currentTarget);
    await sendEmail(email);
  };

  return (
    <>
      <AuthModalHeader title="Forgot password" onBack={onBack} />
      <AuthForm
        className="flex flex-col items-end py-8 px-14"
        onSubmit={onSendEmail}
        data-testid="recovery_form"
      >
        <TokenInput token={token} />
        <AuthModalText className="text-center">
          Enter the email address you registered with and we will send you a
          verification code.
        </AuthModalText>
        <TextField
          className={{ container: 'mt-6 w-full' }}
          name="email"
          type="email"
          inputId="email"
          label="Email"
          defaultValue={initialEmail}
          hint={hint as string}
          valid={!hint}
          onChange={() => hint && setHint('')}
          leftIcon={<MailIcon />}
        />
        <Button
          className="mt-6 bg-theme-color-cabbage"
          type="submit"
          disabled={isLoading}
        >
          Send verification code
        </Button>
      </AuthForm>
    </>
  );
}

export default ForgotPasswordForm;
