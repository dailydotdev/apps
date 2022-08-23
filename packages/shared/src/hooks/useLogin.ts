import { useContext, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { LoginFormParams } from '../components/auth/LoginForm';
import AuthContext from '../contexts/AuthContext';
import {
  getNodeValue,
  LoginPasswordParameters,
  ValidateLoginParams,
} from '../lib/auth';
import {
  AuthFlow,
  EmptyObjectLiteral,
  InitializationData,
  initializeKratosFlow,
  submitKratosFlow,
} from '../lib/kratos';

interface UseLogin {
  loginFlowData: InitializationData;
  loginHint?: ReturnType<typeof useState>;
  onPasswordLogin: (params: LoginFormParams) => void;
}

interface UseLoginProps {
  queryEnabled?: boolean;
  queryParams?: EmptyObjectLiteral;
  onSuccessfulPasswordLogin?: (() => Promise<void>) | (() => void);
}

const useLogin = ({
  onSuccessfulPasswordLogin,
  queryEnabled = true,
  queryParams = {},
}: UseLoginProps = {}): UseLogin => {
  const { refetchBoot } = useContext(AuthContext);
  const [hint, setHint] = useState('Enter your password to login');
  const { data: login } = useQuery(
    [{ type: 'login', params: queryParams }],
    ({ queryKey: [{ params }] }) =>
      initializeKratosFlow(AuthFlow.Login, params),
    { enabled: queryEnabled },
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
        onSuccessfulPasswordLogin?.();
      },
    },
  );

  const onSubmitPasswordLogin = (form: LoginFormParams) => {
    const { nodes, action } = login.ui;
    const csrfToken = getNodeValue('csrf_token', nodes);
    const params: LoginPasswordParameters = {
      ...form,
      csrf_token: csrfToken,
      method: 'password',
    };
    onPasswordLogin({ action, params });
  };

  return useMemo(
    () => ({
      loginFlowData: login,
      loginHint: [hint, setHint],
      onPasswordLogin: onSubmitPasswordLogin,
    }),
    [queryEnabled, queryParams, hint, login],
  );
};

export default useLogin;
