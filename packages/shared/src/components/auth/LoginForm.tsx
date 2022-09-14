import classNames from 'classnames';
import React, { FormEvent, ReactElement, useState } from 'react';
import { LoginPasswordParameters } from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { PasswordField } from '../fields/PasswordField';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import { AuthForm } from './common';

interface LoginFormProps {
  onForgotPassword?: () => unknown;
  onPasswordLogin?: (params: LoginFormParams) => void;
  email?: string;
  loginHint: ReturnType<typeof useState>;
  className?: string;
  isLoading?: boolean;
}

export type LoginFormParams = Pick<
  LoginPasswordParameters,
  'identifier' | 'password'
>;

export interface LoginSocialFormParams {
  provider: string;
}

function LoginForm({
  onForgotPassword,
  onPasswordLogin,
  email,
  loginHint: [hint, setHint],
  className,
  isLoading,
}: LoginFormProps): ReactElement {
  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formToJson<LoginFormParams>(e.currentTarget);
    onPasswordLogin(form);
  };

  return (
    <AuthForm
      className={classNames('gap-2', className)}
      onSubmit={onLogin}
      data-testid="login_form"
    >
      <TextField
        leftIcon={<MailIcon />}
        inputId="identifier"
        name="identifier"
        label="Email"
        type="email"
        value={email}
        data-testid="login_email"
        saveHintSpace
        hint={hint as string}
        onChange={() => hint && setHint(null)}
        valid={!hint}
      />
      <PasswordField
        data-testid="login_password"
        inputId="password"
        name="password"
        label="Password"
        showStrength={false}
      />
      <span className="flex flex-row mt-4 w-full">
        {onForgotPassword && (
          <ClickableText
            type="button"
            className="flex-1 underline btn-primary"
            onClick={onForgotPassword}
          >
            Forgot password?
          </ClickableText>
        )}
        <Button
          className={classNames(
            'flex-1 btn-primary text-theme-label-primary max-w-[9.375rem]',
            !isLoading && 'bg-theme-color-cabbage',
          )}
          type="submit"
          disabled={isLoading}
        >
          Login
        </Button>
      </span>
    </AuthForm>
  );
}

export default LoginForm;
