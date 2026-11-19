import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { formToJson } from '../../lib/form';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { MailIcon } from '../icons';
import { IconSize } from '../Icon';
import type { CloseModalFunc } from '../modals/common';
import AuthHeader from './AuthHeader';
import { AuthScreenMail, AuthScreenTitle } from './AuthScreenTitle';
import {
  FunnelGlassBar,
  funnelGlassBarCta,
} from '../../features/onboarding/shared/FunnelGlassBar';
import { AuthActionBar } from './AuthActionBar';
import { ClickableText } from '../buttons/ClickableText';
import type { AuthFormProps } from './common';
import { AuthModalText } from './common';
import { AuthEventNames } from '../../lib/auth';
import { useLogContext } from '../../contexts/LogContext';
import AuthForm from './AuthForm';
import { useAuthData } from '../../contexts/AuthDataContext';
import { betterAuthForgetPassword } from '../../lib/betterAuth';

interface ForgotPasswordFormProps extends AuthFormProps {
  onBack?: CloseModalFunc;
  hasTopBarBack?: boolean;
  isStartups?: boolean;
}

function ForgotPasswordForm({
  onBack,
  hasTopBarBack,
  simplified,
  isStartups,
}: ForgotPasswordFormProps): ReactElement {
  const { email: initialEmail, setEmail } = useAuthData();
  const { logEvent } = useLogContext();
  const [hint, setHint] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSendEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logEvent({
      event_name: AuthEventNames.SubmitForgotPassword,
    });
    const { email } = formToJson<{ email: string }>(e.currentTarget);
    setEmail(email);

    setIsLoading(true);
    setHint('');
    const redirectTo = `${window.location.origin}/reset-password`;
    const res = await betterAuthForgetPassword(email, redirectTo);
    setIsLoading(false);

    if (res.error) {
      setHint(res.error);
      return;
    }

    setEmailSent(true);
  };

  const headerBack = hasTopBarBack ? undefined : onBack;
  const backToLogin = simplified && onBack && (
    <ClickableText className="self-center" type="button" onClick={onBack}>
      ← Back to log in
    </ClickableText>
  );

  if (isStartups && emailSent) {
    return (
      <div className="flex flex-col gap-6">
        <AuthScreenMail />
        <AuthScreenTitle
          title="Check your email"
          description={
            <>
              We sent a reset link to{' '}
              <span className="font-bold text-text-primary">
                {initialEmail}
              </span>
              . Open it, then come back to finish.
            </>
          }
        />
        <Button
          className="w-full"
          size={ButtonSize.Large}
          variant={ButtonVariant.Float}
          onClick={() => setEmailSent(false)}
        >
          Didn&apos;t receive it? Try again
        </Button>
      </div>
    );
  }

  if (isStartups) {
    return (
      <div className="flex flex-col gap-6">
        <AuthScreenTitle
          title="Reset your password"
          description="We'll email you a link to set a new one."
        />
        <AuthForm
          aria-label="Forgot password"
          className="flex flex-col gap-6"
          onSubmit={onSendEmail}
          data-testid="recovery_form"
        >
          <TextField
            className={{ container: 'w-full' }}
            name="email"
            type="email"
            autoComplete="email"
            inputId="email"
            label="Email"
            defaultValue={initialEmail}
            hint={hint}
            valid={!hint}
            onChange={() => hint && setHint('')}
            leftIcon={<MailIcon aria-hidden role="presentation" />}
          />
          <FunnelGlassBar>
            <Button
              className={funnelGlassBarCta}
              size={ButtonSize.Medium}
              variant={ButtonVariant.Primary}
              type="submit"
              disabled={isLoading}
            >
              Send reset link
            </Button>
          </FunnelGlassBar>
        </AuthForm>
      </div>
    );
  }

  if (emailSent) {
    return (
      <>
        <AuthHeader
          simplified={simplified}
          title="Check your email"
          onBack={headerBack}
        />
        <div className="flex flex-col items-center p-6">
          <MailIcon
            className="mb-4 text-text-tertiary"
            size={IconSize.XXLarge}
          />
          <AuthModalText className="text-center">
            We sent a password reset link to your email. Click the link in the
            email to reset your password.
          </AuthModalText>
          <Button
            className="mt-6 w-full"
            size={ButtonSize.Large}
            variant={ButtonVariant.Secondary}
            onClick={() => setEmailSent(false)}
          >
            Didn&apos;t receive it? Try again
          </Button>
          {backToLogin && <div className="mt-6">{backToLogin}</div>}
        </div>
      </>
    );
  }

  return (
    <>
      <AuthHeader
        simplified={simplified}
        title="Reset password"
        onBack={headerBack}
      />
      <AuthForm
        aria-label="Forgot password"
        className="flex flex-col items-end px-6 pt-6"
        onSubmit={onSendEmail}
        data-testid="recovery_form"
      >
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
          hint={hint}
          valid={!hint}
          onChange={() => hint && setHint('')}
          leftIcon={<MailIcon aria-hidden role="presentation" />}
          autoFocus
        />
        <AuthActionBar type="submit" disabled={isLoading}>
          Send reset link
        </AuthActionBar>
        {backToLogin}
      </AuthForm>
    </>
  );
}

export default ForgotPasswordForm;
