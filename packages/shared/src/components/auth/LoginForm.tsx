import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import { AuthForm } from './common';

interface LoginFormProps {
  onSubmit: (e: React.FormEvent) => unknown;
  onForgotPassword?: () => unknown;
}

function LoginForm({
  onSubmit,
  onForgotPassword,
}: LoginFormProps): ReactElement {
  return (
    <AuthForm className="gap-2" onSubmit={onSubmit} action="#">
      <TextField
        leftIcon={<MailIcon />}
        inputId="email"
        label="Email"
        type="email"
      />
      <p className="ml-2 text-theme-label-quaternary typo-caption1">
        Enter your password to login
      </p>
      <TextField
        leftIcon={<MailIcon />}
        inputId="password"
        label="Password"
        type="password"
      />
      <span className="flex flex-row mt-5 w-full">
        <ClickableText
          className="flex-1 btn-primary"
          onClick={onForgotPassword}
        >
          Forgot password?
        </ClickableText>
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
