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
  loginHint?: ReturnType<typeof useState>;
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
  loginHint: [hint, setHint],
}: LoginFormProps): ReactElement {
  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formToJson<LoginFormParams>(e.currentTarget);
    onPasswordLogin(form);
  };

  return (
    <AuthForm className="gap-2" onSubmit={onLogin} data-testid="login_form">
      <TextField
        leftIcon={<MailIcon />}
        inputId="identifier"
        name="identifier"
        label="Email"
        type="email"
        saveHintSpace
        hint={hint as string}
        onChange={() => hint && setHint(null)}
        valid={!!hint}
      />
      <PasswordField
        inputId="password"
        name="password"
        label="Password"
        showStrength={false}
      />
      <span className="flex flex-row mt-4 w-full">
        {onForgotPassword && (
          <ClickableText
            type="button"
            className="flex-1 btn-primary"
            onClick={onForgotPassword}
          >
            Forgot password?
          </ClickableText>
        )}
        <Button
          className="flex-1 btn-primary bg-theme-color-cabbage text-theme-label-primary max-w-[9.375rem]"
          type="submit"
        >
          Login
        </Button>
      </span>
    </AuthForm>
  );
}

export default LoginForm;
