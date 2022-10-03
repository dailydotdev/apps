import { useContext, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { LoginFormParams } from '../components/auth/LoginForm';
import AuthContext from '../contexts/AuthContext';
import {
  AuthEventNames,
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
import AnalyticsContext from '../contexts/AnalyticsContext';

interface UseLogin {
  isPasswordLoginLoading?: boolean;
  loginFlowData: InitializationData;
  loginHint?: ReturnType<typeof useState>;
  onSocialLogin: (provider: string) => void;
  onPasswordLogin: (params: LoginFormParams) => void;
}

interface UseLoginProps {
  enableSessionVerification?: boolean;
  queryEnabled?: boolean;
  queryParams?: EmptyObjectLiteral;
  trigger?: string;
  onSuccessfulLogin?: (() => Promise<void>) | (() => void);
}

const useLogin = ({
  trigger,
  onSuccessfulLogin,
  queryEnabled = true,
  queryParams = {},
  enableSessionVerification = false,
}: UseLoginProps = {}): UseLogin => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { refetchBoot } = useContext(AuthContext);
  const [hint, setHint] = useState('Enter your password to login');
  const { data: session } = useQuery(['current_session'], getKratosSession, {
    enabled: enableSessionVerification,
  });
  const { data: login } = useQuery(
    [{ type: 'login', params: queryParams }],
    ({ queryKey: [{ params }] }) =>
      initializeKratosFlow(AuthFlow.Login, params),
    { enabled: queryEnabled },
  );
  const { mutateAsync: onPasswordLogin, isLoading } = useMutation(
    (params: ValidateLoginParams) => {
      trackEvent({
        event_name: 'click',
        target_type: AuthEventNames.LoginProvider,
        target_id: 'email',
        extra: JSON.stringify({ trigger }),
      });
      return submitKratosFlow(params);
    },
    {
      onSuccess: async ({ error }) => {
        if (error) {
          trackEvent({
            event_name: AuthEventNames.LoginError,
            extra: JSON.stringify({ error: 'Invalid username or password' }),
          });
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
          trackEvent({
            event_name: AuthEventNames.LoginError,
            extra: JSON.stringify({ error: 'Invalid username or password' }),
          });
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
      isPasswordLoginLoading: isLoading,
      onSocialLogin: onSubmitSocialLogin,
      onPasswordLogin: onSubmitPasswordLogin,
    }),
    [queryEnabled, queryParams, hint, login, isLoading],
  );
};

export default useLogin;
