import classNames from 'classnames';
import React, { FormEvent, ReactElement, useContext, useState } from 'react';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import VIcon from '../icons/V';
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
}

function ForgotPasswordForm({
  initialEmail,
  onBack,
}: ForgotPasswordFormProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [hint, setHint] = useState('');
  const [successHint, setSuccessHint] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { sendEmail, resendTimer, isLoading, token } = useAccountEmailFlow(
    AuthFlow.Recovery,
    {
      onTimerFinished: () => setEmailSent(false),
      onError: setHint,
      onSuccess: () => {
        setEmailSent(true);
        setSuccessHint('We have sent you a password reset link.');
      },
    },
  );

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
          password reset link.
        </AuthModalText>
        <TextField
          className={{ container: 'mt-6 w-full' }}
          name="email"
          type="email"
          inputId="email"
          label="Email"
          defaultValue={initialEmail}
          hint={(hint as string) || successHint}
          valid={!hint}
          onChange={() => hint && setHint('')}
          leftIcon={<MailIcon />}
          rightIcon={
            emailSent && (
              <VIcon
                className="text-theme-color-avocado"
                data-testid="email_sent_icon"
              />
            )
          }
        />
        <Button
          className={classNames(
            'mt-6',
            emailSent ? 'btn-primary' : 'bg-theme-color-cabbage',
          )}
          type="submit"
          disabled={emailSent || isLoading}
        >
          {resendTimer === 0 ? 'Send email' : `${resendTimer}s`}
        </Button>
      </AuthForm>
    </>
  );
}

export default ForgotPasswordForm;
