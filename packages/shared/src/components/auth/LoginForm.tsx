import React, { ReactElement, useRef } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  getNodeValue,
  LoginPasswordParameters,
  ValidateLoginParams,
} from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { disabledRefetch } from '../../lib/func';
import {
  AuthFlow,
  initializeKratosFlow,
  submitKratosFlow,
} from '../../lib/kratos';
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
  const formRef = useRef<HTMLFormElement>();
  const { data: login } = useQuery(
    'login',
    () => initializeKratosFlow(AuthFlow.Login),
    { ...disabledRefetch },
  );
  const { mutateAsync: onPasswordLogin } = useMutation(
    (params: ValidateLoginParams) => submitKratosFlow(params),
    // { onSuccess: ({ data }) => {} }, // refetch boot after login
  );
  const onLogin: typeof onSuccessfulLogin = async (e) => {
    e.preventDefault();
    const form = formToJson<LoginFormParams>(formRef.current);
    const { nodes, action } = login.ui;
    const csrfToken = getNodeValue('csrf_token', nodes);
    const params: LoginPasswordParameters = { ...form, csrf_token: csrfToken };
    onPasswordLogin({ action, params });
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
