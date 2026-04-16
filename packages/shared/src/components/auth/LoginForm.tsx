import classNames from 'classnames';
import type { Dispatch, FormEvent, ReactElement, SetStateAction } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { Turnstile } from '@marsidev/react-turnstile';
import type { LoginPasswordParameters } from '../../lib/auth';
import { AuthEventNames } from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button, ButtonVariant } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { PasswordField } from '../fields/PasswordField';
import { TextField } from '../fields/TextField';
import { MailIcon } from '../icons';
import AuthForm from './AuthForm';
import { IconSize } from '../Icon';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { labels } from '../../lib';
import { useLogContext } from '../../contexts/LogContext';

export interface LoginFormProps {
  onForgotPassword?: (email: string) => unknown;
  onPasswordLogin?: (params: LoginFormParams) => void;
  email?: string;
  loginHint: LoginHintState;
  loginButton?: string;
  className?: string;
  isLoading?: boolean;
  isReady: boolean;
  autoFocus?: boolean;
  onSignup: () => void;
}

export type LoginHintState = [
  string | null,
  Dispatch<SetStateAction<string | null>>,
];

export type LoginFormParams = Pick<
  LoginPasswordParameters,
  'identifier' | 'password'
> & {
  turnstileToken?: string;
};

function LoginForm({
  onForgotPassword,
  onPasswordLogin,
  email,
  loginHint: [hint, setHint],
  loginButton = 'Log in',
  className,
  isLoading,
  isReady,
  autoFocus = true,
  onSignup,
}: LoginFormProps): ReactElement {
  const { logEvent } = useLogContext();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [turnstileError, setTurnstileError] = useState(false);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_KEY ?? '';

  useEffect(() => {
    if (hint) {
      turnstileRef.current?.reset();
    }
  }, [hint]);

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!onPasswordLogin) {
      return;
    }

    if (turnstileSiteKey && !turnstileRef.current?.getResponse()) {
      logEvent({
        event_name: AuthEventNames.LoginError,
        extra: JSON.stringify({
          error: 'Turnstile not valid',
          origin: 'login turnstile',
        }),
      });
      setTurnstileError(true);
      return;
    }

    const form = formToJson<LoginFormParams>(e.currentTarget);
    form.turnstileToken = turnstileRef.current?.getResponse() ?? undefined;
    onPasswordLogin(form);
  };
  const [shouldFocus, setShouldFocus] = useState(autoFocus);
  const [innerEmail, setInnerEmail] = useState(email || '');

  return (
    <AuthForm
      aria-label="Login using email and password"
      className={classNames('gap-2', className)}
      onSubmit={onLogin}
      data-testid="login_form"
      ref={(form) => {
        if (!form) {
          return;
        }

        const id = email ? 'password' : 'identifier';
        const element = document.getElementById(id);
        if (shouldFocus && !!element) {
          element?.focus();
          setShouldFocus(false);
        }
      }}
    >
      <TextField
        leftIcon={
          <MailIcon role="presentation" aria-hidden size={IconSize.Small} />
        }
        inputId="identifier"
        name="identifier"
        label="Email"
        type="email"
        value={email}
        data-testid="login_email"
        saveHintSpace
        onChange={(e) => {
          setInnerEmail(e.target.value);
          if (hint) {
            setHint(null);
          }
        }}
        valid={!hint}
        required
      />
      <PasswordField
        data-testid="login_password"
        inputId="password"
        name="password"
        label="Password"
        showStrength={false}
        saveHintSpace
        onChange={() => hint && setHint(null)}
      />
      {turnstileSiteKey && (
        <Turnstile
          ref={turnstileRef}
          siteKey={turnstileSiteKey}
          options={{ theme: 'dark' }}
          className="mx-auto min-h-[4.5rem]"
          onWidgetLoad={() => setTurnstileLoaded(true)}
        />
      )}
      {turnstileError && (
        <Alert
          type={AlertType.Error}
          title="Please complete the security check."
        />
      )}
      <span className="mt-4 flex w-full flex-row">
        {onForgotPassword && (
          <ClickableText
            type="button"
            className="btn-primary flex-1 grow-[2] underline"
            onClick={() => onForgotPassword(innerEmail)}
          >
            Forgot password?
          </ClickableText>
        )}
        <Button
          className="flex-1"
          variant={ButtonVariant.Primary}
          type="submit"
          loading={!isReady}
          disabled={isLoading || (!!turnstileSiteKey && !turnstileLoaded)}
        >
          {loginButton}
        </Button>
      </span>
      {hint && hint === labels.auth.error.invalidEmailOrPassword && (
        <Alert className="mt-6" type={AlertType.Error} flexDirection="flex-row">
          <AlertParagraph className="!mt-0 flex-1">
            The email or password you entered doesn&apos;t match our records.
            Please try again or{' '}
            <ClickableText
              onClick={onSignup}
              className="font-bold text-white underline hover:no-underline"
            >
              create new account.
            </ClickableText>
          </AlertParagraph>
        </Alert>
      )}
    </AuthForm>
  );
}

export default LoginForm;
