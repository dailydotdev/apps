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
  AuthFlow,
  EmptyObjectLiteral,
  getKratosFlow,
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
          return;
        }

        if (redirect) {
          window.open(redirect);
          return;
        }

        await refetchBoot();
        onSuccessfulLogin?.();
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

  useWindowEvents('message', async (e) => {
    console.log(e);
    // if (e.data?.flow) {
    //   const flow = await getKratosFlow(AuthFlow.Login, e.data.flow);
    //   const { nodes, action } = flow.ui;
    //   onSelectedProvider({
    //     action,
    //     provider: getNodeValue('provider', nodes),
    //     csrf_token: getNodeValue('csrf_token', nodes),
    //     email: getNodeValue('traits.email', nodes),
    //     name: getNodeValue('traits.name', nodes),
    //     username: getNodeValue('traits.username', nodes),
    //     image: getNodeValue('traits.image', nodes) || fallbackImages.avatar,
    //   });
    //   setActiveDisplay(Display.Registration);
    // }
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
