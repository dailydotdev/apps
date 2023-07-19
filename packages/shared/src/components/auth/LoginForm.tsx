import classNames from 'classnames';
import React, { FormEvent, ReactElement, useState } from 'react';
import { LoginPasswordParameters } from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { PasswordField } from '../fields/PasswordField';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import AuthForm from './AuthForm';
import { IconSize } from '../Icon';

interface LoginFormProps {
  onForgotPassword?: () => unknown;
  onPasswordLogin?: (params: LoginFormParams) => void;
  email?: string;
  loginHint: ReturnType<typeof useState>;
  loginButton?: string;
  className?: string;
  isLoading?: boolean;
  isReady: boolean;
  autoFocus?: boolean;
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
}: LoginFormProps): ReactElement {
  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formToJson<LoginFormParams>(e.currentTarget);
    onPasswordLogin(form);
  };
  const [shouldFocus, setShouldFocus] = useState(autoFocus);

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
        onChange={() => hint && setHint(null)}
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
        hint={hint as string}
        onChange={() => hint && setHint(null)}
      />
      <span className="flex flex-row mt-4 w-full">
        {onForgotPassword && (
          <ClickableText
            type="button"
            className="flex-1 underline grow-[2] btn-primary"
            onClick={onForgotPassword}
          >
            Forgot password?
          </ClickableText>
        )}
        <Button
          className={classNames(
            'flex-1 btn-primary text-theme-label-primary',
            !isLoading && 'bg-theme-color-cabbage',
          )}
          type="submit"
          loading={!isReady}
          disabled={isLoading}
        >
          {loginButton}
        </Button>
      </span>
    </AuthForm>
  );
}

export default LoginForm;
