import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { formToJson } from '../../lib/form';
import { Button, ButtonVariant } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { MailIcon } from '../icons';
import { IconSize } from '../Icon';
import type { CloseModalFunc } from '../modals/common';
import AuthHeader from './AuthHeader';
import type { AuthFormProps } from './common';
import { AuthModalText } from './common';
import TokenInput from './TokenField';
import { AuthFlow } from '../../lib/kratos';
import useAccountEmailFlow from '../../hooks/useAccountEmailFlow';
import { AuthEventNames } from '../../lib/auth';
import { useLogContext } from '../../contexts/LogContext';
import AuthForm from './AuthForm';
import { useAuthData } from '../../contexts/AuthDataContext';
import { useIsBetterAuth } from '../../hooks/useIsBetterAuth';
import { betterAuthForgetPassword } from '../../lib/betterAuth';
import { webappUrl } from '../../lib/constants';

const AuthModalFooter = dynamic(
  () => import(/* webpackChunkName: "authModalFooter" */ './AuthModalFooter'),
);

interface ForgotPasswordFormProps extends AuthFormProps {
  onBack?: CloseModalFunc;
  onSubmit?: (email: string, flow: string) => void;
}

function ForgotPasswordForm({
  onBack,
  onSubmit,
  simplified,
}: ForgotPasswordFormProps): ReactElement {
  const { email: initialEmail, setEmail } = useAuthData();
  const { logEvent } = useLogContext();
  const [hint, setHint] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isBALoading, setIsBALoading] = useState(false);
  const isBetterAuth = useIsBetterAuth();
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
    setEmail(email);

    if (isBetterAuth) {
      setIsBALoading(true);
      setHint('');
      const redirectTo = `${webappUrl}reset-password`;
      const res = await betterAuthForgetPassword(email, redirectTo);
      setIsBALoading(false);

      if (res.error) {
        setHint(res.error);
        return;
      }

      setEmailSent(true);
      return;
    }

    await sendEmail(email);
  };

  if (isBetterAuth && emailSent) {
    return (
      <>
        <AuthHeader
          simplified={simplified}
          title="Check your email"
          onBack={onBack}
        />
        <div className="flex flex-col items-center px-14 py-8">
          <MailIcon
            className="mb-4 text-text-tertiary"
            size={IconSize.XXLarge}
          />
          <AuthModalText className="text-center">
            We sent a password reset link to your email. Click the link in the
            email to reset your password.
          </AuthModalText>
          <Button
            className="mt-6"
            variant={ButtonVariant.Secondary}
            onClick={() => setEmailSent(false)}
          >
            Didn&apos;t receive it? Try again
          </Button>
        </div>
        {simplified && onBack && (
          <AuthModalFooter
            text={{ button: `\u2190 Back to log in` }}
            onClick={onBack}
          />
        )}
      </>
    );
  }

  return (
    <>
      <AuthHeader
        simplified={simplified}
        title="Reset password"
        onBack={onBack}
      />
      <AuthForm
        aria-label="Forgot password"
        className="flex flex-col items-end px-14 py-8"
        onSubmit={onSendEmail}
        data-testid="recovery_form"
      >
        {!isBetterAuth && token && <TokenInput token={token} />}
        <AuthModalText className="text-center">
          {isBetterAuth
            ? 'Enter the email address you registered with and we will send you a password reset link.'
            : 'Enter the email address you registered with and we will send you a verification code.'}
        </AuthModalText>
        <TextField
          className={{ container: 'mt-6 w-full' }}
          name="email"
          type="email"
          inputId="email"
          label="Email"
          defaultValue={initialEmail}
          hint={hint}
          valid={!hint}
          onChange={() => hint && setHint('')}
          leftIcon={<MailIcon aria-hidden role="presentation" />}
          autoFocus
        />
        <Button
          className="mt-6"
          variant={ButtonVariant.Primary}
          type="submit"
          disabled={isBetterAuth ? isBALoading : isLoading}
        >
          {isBetterAuth ? 'Send reset link' : 'Send verification code'}
        </Button>
      </AuthForm>
      {simplified && onBack && (
        <AuthModalFooter
          text={{ button: `\u2190 Back to log in` }}
          onClick={onBack}
        />
      )}
    </>
  );
}

export default ForgotPasswordForm;
