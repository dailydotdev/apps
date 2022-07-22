import React, { ReactElement, useContext, useRef } from 'react';
import { useQuery } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
import { initializeLogin, LoginPasswordParameters } from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { disabledRefetch } from '../../lib/func';
import { Button } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import { AuthForm } from './common';

interface LoginFormProps {
  onSuccessfulLogin: (e: React.FormEvent) => unknown;
  onForgotPassword?: () => unknown;
}

type LoginFormParams = Pick<LoginPasswordParameters, 'identifier' | 'password'>;

function LoginForm({
  onSuccessfulLogin,
  onForgotPassword,
}: LoginFormProps): ReactElement {
  const { onPasswordLogin } = useContext(AuthContext);
  const formRef = useRef<HTMLFormElement>();
  const { data } = useQuery('login', initializeLogin, { ...disabledRefetch });
  const onLogin: typeof onSuccessfulLogin = async (e) => {
    e.preventDefault();
    const form = formToJson<LoginFormParams>(formRef.current);
    const csrfToken = data.ui.nodes[0].attributes.value;
    const params: LoginPasswordParameters = { ...form, csrf_token: csrfToken };
    const session = await onPasswordLogin(data.ui.action, params);
    if (session) {
      onSuccessfulLogin(e);
    }
  };

  return (
    <AuthForm className="gap-2" onSubmit={onLogin} action="#" ref={formRef}>
      <TextField
        leftIcon={<MailIcon />}
        inputId="identifier"
        name="identifier"
        label="Email"
        type="email"
      />
      <p className="ml-2 text-theme-label-quaternary typo-caption1">
        Enter your password to login
      </p>
      <TextField
        leftIcon={<MailIcon />}
        inputId="password"
        name="password"
        label="Password"
        type="password"
      />
      <span className="flex flex-row mt-4 w-full">
        <ClickableText
          type="button"
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
