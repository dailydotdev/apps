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
  AuthSession,
  EmptyObjectLiteral,
  getKratosSession,
  InitializationData,
  initializeKratosFlow,
  submitKratosFlow,
} from '../lib/kratos';
import useWindowEvents from './useWindowEvents';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { useToastNotification } from './useToastNotification';
import { SignBackProvider, useSignBack } from './auth/useSignBack';
import { LoggedUser } from '../lib/user';
import { labels } from '../lib';

const LOGIN_FLOW_NOT_AVAILABLE_TOAST =
  'An error occurred, please refresh the page.';

interface UseLogin {
  isPasswordLoginLoading?: boolean;
  loginFlowData: InitializationData;
  loginHint?: ReturnType<typeof useState>;
  isReady: boolean;
  onSocialLogin: (provider: string) => void;
  onPasswordLogin: (params: LoginFormParams) => void;
}

interface UseLoginProps {
  enableSessionVerification?: boolean;
  queryEnabled?: boolean;
  queryParams?: EmptyObjectLiteral;
  trigger?: string;
  provider?: string;
  session?: AuthSession;
  onSuccessfulLogin?: (() => Promise<void>) | (() => void);
}

const useLogin = ({
  trigger,
  provider: providerProp,
  onSuccessfulLogin,
  queryEnabled = true,
  queryParams = {},
  session,
}: UseLoginProps = {}): UseLogin => {
  const { onUpdateSignBack } = useSignBack();
  const { displayToast } = useToastNotification();
  const { trackEvent } = useContext(AnalyticsContext);
  const { refetchBoot } = useContext(AuthContext);
  const [hint, setHint] = useState('Enter your password to login');
  const { data: login } = useQuery(
    [{ type: 'login', params: queryParams }],
    ({ queryKey: [{ params }] }) =>
      initializeKratosFlow(AuthFlow.Login, params),
    { enabled: queryEnabled, refetchOnWindowFocus: false },
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
            extra: JSON.stringify({
              error: labels.auth.error.invalidEmailOrPassword,
            }),
          });
          setHint(labels.auth.error.invalidEmailOrPassword);
          return;
        }

        const { data: boot } = await refetchBoot();

        if (boot.user) {
          onUpdateSignBack(boot.user as LoggedUser, 'password');
        }

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
            extra: JSON.stringify({
              error: labels.auth.error.invalidEmailOrPassword,
            }),
          });
          setHint(labels.auth.error.invalidEmailOrPassword);
        }

        if (redirect) {
          window.open(redirect);
        }
      },
    },
  );

  const onSubmitSocialLogin = (provider: string) => {
    if (!login?.ui) {
      displayToast(LOGIN_FLOW_NOT_AVAILABLE_TOAST);
      return;
    }
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
    if (!login?.ui) {
      displayToast(LOGIN_FLOW_NOT_AVAILABLE_TOAST);
      return;
    }
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
      const { data: boot } = await refetchBoot();

      if (boot.user) {
        onUpdateSignBack(
          boot.user as LoggedUser,
          providerProp as SignBackProvider,
        );
      }

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
      const { data: boot } = await refetchBoot();

      if (boot.user) {
        onUpdateSignBack(
          boot.user as LoggedUser,
          providerProp as SignBackProvider,
        );
      }

      onSuccessfulLogin?.();
    }
  });

  return useMemo<UseLogin>(
    () => ({
      loginFlowData: login,
      loginHint: [hint, setHint],
      isPasswordLoginLoading: isLoading,
      isReady: !!login?.ui,
      onSocialLogin: onSubmitSocialLogin,
      onPasswordLogin: onSubmitPasswordLogin,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryEnabled, queryParams, hint, login, isLoading],
  );
};

export default useLogin;
