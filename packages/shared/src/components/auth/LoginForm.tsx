import React, { ReactElement, useContext, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
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
import { PasswordField } from '../fields/PasswordField';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import { AuthForm } from './common';
import TokenInput from './TokenField';

interface LoginFormProps {
  onSuccessfulLogin: (e?: React.FormEvent) => unknown;
  onForgotPassword?: () => unknown;
}

type LoginFormParams = Pick<LoginPasswordParameters, 'identifier' | 'password'>;

function LoginForm({
  onSuccessfulLogin,
  onForgotPassword,
}: LoginFormProps): ReactElement {
  const { refetchBoot } = useContext(AuthContext);
  const [hint, setHint] = useState('Enter your password to login');
  const formRef = useRef<HTMLFormElement>();
  const { data: login } = useQuery(
    'login',
    () => initializeKratosFlow(AuthFlow.Login),
    { ...disabledRefetch },
  );
  const { mutateAsync: onPasswordLogin } = useMutation(
    (params: ValidateLoginParams) => submitKratosFlow(params),
    {
      onSuccess: async ({ error }) => {
        if (error) {
          setHint('Invalid username or password');
          return;
        }

        await refetchBoot();
        onSuccessfulLogin();
      },
    },
  );
  const onLogin: typeof onSuccessfulLogin = async (e) => {
    e.preventDefault();
    const form = formToJson<LoginFormParams>(formRef.current);
    const { nodes, action } = login.ui;
    const csrfToken = getNodeValue('csrf_token', nodes);
    const params: LoginPasswordParameters = {
      ...form,
      csrf_token: csrfToken,
      method: 'password',
    };
    onPasswordLogin({ action, params });
  };

  return (
    <AuthForm
      className="gap-2"
      onSubmit={onLogin}
      ref={formRef}
      data-testid="login_form"
    >
      <TokenInput token={getNodeValue('csrf_token', login?.ui?.nodes)} />
      <TextField
        leftIcon={<MailIcon />}
        inputId="identifier"
        name="identifier"
        label="Email"
        type="email"
        saveHintSpace
        hint={hint}
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
