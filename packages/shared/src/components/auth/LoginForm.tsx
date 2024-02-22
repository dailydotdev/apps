import classNames from 'classnames';
import React, { FormEvent, ReactElement, useState } from 'react';
import { LoginPasswordParameters } from '../../lib/auth';
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

export interface LoginFormProps {
  onForgotPassword?: (email: string) => unknown;
  onPasswordLogin?: (params: LoginFormParams) => void;
  email?: string;
  loginHint: ReturnType<typeof useState>;
  loginButton?: string;
  className?: string;
  isLoading?: boolean;
  isReady: boolean;
  autoFocus?: boolean;
  onSignup: () => void;
}

export type LoginFormParams = Pick<
  LoginPasswordParameters,
  'identifier' | 'password'
>;

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
  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formToJson<LoginFormParams>(e.currentTarget);
    onPasswordLogin(form);
  };
  const [shouldFocus, setShouldFocus] = useState(autoFocus);
  const [innerEmail, setInnerEmail] = useState(email || '');

  return (
    <AuthForm
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
        leftIcon={<MailIcon size={IconSize.Small} />}
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
          disabled={isLoading}
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
