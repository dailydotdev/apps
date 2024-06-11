import React, { FormEvent, ReactElement, useContext, useState } from 'react';
import { formToJson } from '../../lib/form';
import { Button, ButtonVariant } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { MailIcon } from '../icons';
import { CloseModalFunc } from '../modals/common';
import AuthHeader from './AuthHeader';
import { AuthFormProps, AuthModalText } from './common';
import TokenInput from './TokenField';
import { AuthFlow } from '../../lib/kratos';
import useAccountEmailFlow from '../../hooks/useAccountEmailFlow';
import { AuthEventNames } from '../../lib/auth';
import LogContext from '../../contexts/LogContext';
import AuthForm from './AuthForm';
import AuthModalFooter from './AuthModalFooter';

interface ForgotPasswordFormProps extends AuthFormProps {
  initialEmail?: string;
  onBack?: CloseModalFunc;
  onSubmit?: (email: string, flow: string) => void;
}

function ForgotPasswordForm({
  initialEmail,
  onBack,
  onSubmit,
  simplified,
}: ForgotPasswordFormProps): ReactElement {
  const { logEvent } = useContext(LogContext);
  const [hint, setHint] = useState('');
  const { sendEmail, isLoading, token } = useAccountEmailFlow({
    flow: AuthFlow.Recovery,
    onError: setHint,
    onSuccess: onSubmit,
  });

  const onSendEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logEvent({
      event_name: AuthEventNames.SubmitForgotPassword,
    });
    const { email } = formToJson<{ email: string }>(e.currentTarget);
    await sendEmail(email);
  };

  return (
    <>
      <AuthHeader
        simplified={simplified}
        title="Reset password"
        onBack={onBack}
      />
      <AuthForm
        className="flex flex-col items-end px-14 py-8"
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
          className="mt-6"
          variant={ButtonVariant.Primary}
          type="submit"
          disabled={isLoading}
        >
          Send verification code
        </Button>
      </AuthForm>
      {simplified && (
        <AuthModalFooter
          text={{ button: `\u2190 Back to log in` }}
          onClick={onBack}
        />
      )}
    </>
  );
}

export default ForgotPasswordForm;
