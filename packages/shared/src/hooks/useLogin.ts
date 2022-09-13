import { useContext, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { LoginFormParams } from '../components/auth/LoginForm';
import AuthContext from '../contexts/AuthContext';
import {
  getNodeValue,
  LoginPasswordParameters,
  LoginSocialParameters,
  ValidateLoginParams,
} from '../lib/auth';
import {
  AuthEvent,
  AuthFlow,
  EmptyObjectLiteral,
  getKratosSession,
  InitializationData,
  initializeKratosFlow,
  submitKratosFlow,
} from '../lib/kratos';
import useWindowEvents from './useWindowEvents';

interface UseLogin {
  loginFlowData: InitializationData;
  loginHint?: ReturnType<typeof useState>;
  onSocialLogin: (provider: string) => void;
  onPasswordLogin: (params: LoginFormParams) => void;
}

interface UseLoginProps {
  queryEnabled?: boolean;
  queryParams?: EmptyObjectLiteral;
  onSuccessfulLogin?: (() => Promise<void>) | (() => void);
}

const useLogin = ({
  onSuccessfulLogin,
  queryEnabled = true,
  queryParams = {},
}: UseLoginProps = {}): UseLogin => {
  const { refetchBoot } = useContext(AuthContext);
  const [hint, setHint] = useState('Enter your password to login');
  const { data: session } = useQuery(['current_session'], getKratosSession);
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
        onSuccessfulLogin?.();
      },
    },
  );
  const { mutateAsync: onSocialLogin } = useMutation(
    (params: ValidateLoginParams) => submitKratosFlow(params),
    {
      onSuccess: async (res) => {
        const { error, redirect } = res;
        if (error) {
          setHint('Invalid username or password');
        }

        if (redirect) {
          window.open(redirect);
        }
      },
    },
  );

  const onSubmitSocialLogin = (provider: string) => {
    const { nodes, action } = login.ui;
    const csrfToken = getNodeValue('csrf_token', nodes);
    const params: LoginSocialParameters = {
      provider,
      method: 'oidc',
      csrf_token: csrfToken,
    };
    onSocialLogin({ action, params });
  };

  const onSubmitPasswordLogin = (form: LoginFormParams) => {
    const { nodes, action } = login.ui;
    const csrfToken = getNodeValue('csrf_token', nodes);
    const params: LoginPasswordParameters = {
      ...form,
      method: 'password',
      csrf_token: csrfToken,
    };
    onPasswordLogin({ action, params });
  };

  useWindowEvents('message', AuthEvent.Login, async () => {
    if (!session) {
      await refetchBoot();
      onSuccessfulLogin?.();
      return;
    }

    const verified = await getKratosSession();

    if (!verified) {
      return;
    }

    const hasRenewedSession =
      session.authenticated_at !== verified.authenticated_at;

    if (hasRenewedSession) {
      await refetchBoot();
      onSuccessfulLogin?.();
    }
  });

  return useMemo(
    () => ({
      loginFlowData: login,
      loginHint: [hint, setHint],
      onSocialLogin: onSubmitSocialLogin,
      onPasswordLogin: onSubmitPasswordLogin,
    }),
    [queryEnabled, queryParams, hint, login],
  );
};

export default useLogin;
