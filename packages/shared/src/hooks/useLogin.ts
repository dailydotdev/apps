import { useCallback, useContext, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { LoginFormParams } from '../components/auth/LoginForm';
import AuthContext from '../contexts/AuthContext';
import type {
  LoginPasswordParameters,
  LoginSocialParameters,
  ValidateLoginParams,
} from '../lib/auth';
import { AuthEventNames, getNodeValue } from '../lib/auth';
import type {
  AuthSession,
  EmptyObjectLiteral,
  InitializationData,
} from '../lib/kratos';
import {
  AuthEvent,
  AuthFlow,
  getKratosSession,
  initializeKratosFlow,
  submitKratosFlow,
} from '../lib/kratos';
import LogContext from '../contexts/LogContext';
import { useToastNotification } from './useToastNotification';
import type { SignBackProvider } from './auth/useSignBack';
import { useSignBack } from './auth/useSignBack';
import type { LoggedUser } from '../lib/user';
import { labels } from '../lib';
import { useEventListener } from './useEventListener';

const LOGIN_FLOW_NOT_AVAILABLE_TOAST =
  'An error occurred, please refresh the page.';

interface UseLogin {
  isPasswordLoginLoading?: boolean;
  loginHint?: ReturnType<typeof useState>;
  isReady: boolean;
  onSocialLogin: (provider: string) => void;
  onPasswordLogin: (params: LoginFormParams) => void;
}

interface UseLoginProps {
  queryEnabled?: boolean;
  queryParams?: EmptyObjectLiteral;
  trigger?: string;
  provider?: string;
  session?: AuthSession;
  onSuccessfulLogin?:
    | (() => Promise<void>)
    | ((shouldVerify?: boolean) => void);
  onLoginError?: (flow: InitializationData) => void;
}

const useLogin = ({
  trigger,
  provider: providerProp,
  onSuccessfulLogin,
  queryEnabled = true,
  queryParams = {},
  session,
  onLoginError,
}: UseLoginProps = {}): UseLogin => {
  const { onUpdateSignBack } = useSignBack();
  const { displayToast } = useToastNotification();
  const { logEvent } = useContext(LogContext);
  const { refetchBoot } = useContext(AuthContext);
  const hintState = useState('Enter your password to login');
  const [, setHint] = hintState;
  const { data: login } = useQuery({
    queryKey: [AuthEvent.Login, { ...queryParams }],
    queryFn: () => initializeKratosFlow(AuthFlow.Login, queryParams),
    enabled: queryEnabled,
    refetchOnWindowFocus: false,
  });
  const { mutateAsync: onPasswordLogin, isPending: isLoading } = useMutation({
    mutationFn: (params: ValidateLoginParams) => {
      logEvent({
        event_name: 'click',
        target_type: AuthEventNames.LoginProvider,
        target_id: 'email',
        extra: JSON.stringify({ trigger }),
      });
      return submitKratosFlow(params);
    },

    onSuccess: async ({ error }) => {
      if (error) {
        logEvent({
          event_name: AuthEventNames.LoginError,
          extra: JSON.stringify({
            error: labels.auth.error.invalidEmailOrPassword,
          }),
        });
        setHint(labels.auth.error.invalidEmailOrPassword);
        if (onLoginError) {
          onLoginError(error);
        }
        return;
      }

      const { data: boot } = await refetchBoot();

      if (boot.user && !boot.user.shouldVerify) {
        onUpdateSignBack(boot.user as LoggedUser, 'password');
      }

      onSuccessfulLogin?.(boot?.user?.shouldVerify);
    },
  });
  const { mutateAsync: onSocialLogin } = useMutation({
    mutationFn: (params: ValidateLoginParams) => submitKratosFlow(params),

    onSuccess: async (res) => {
      const { error, redirect } = res;
      if (error) {
        logEvent({
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
  });

  const onSubmitSocialLogin = useCallback(
    (provider: string) => {
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
    },
    [displayToast, login?.ui, onSocialLogin],
  );

  const onSubmitPasswordLogin = useCallback(
    (form: LoginFormParams) => {
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
    },
    [displayToast, login?.ui, onPasswordLogin],
  );

  useEventListener(globalThis, 'message', async (e) => {
    if (e.data?.eventKey !== AuthEvent.Login) {
      return;
    }

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

    const { session: verified } = await getKratosSession();

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

  return {
    loginHint: hintState,
    isPasswordLoginLoading: isLoading,
    isReady: !!login?.ui,
    onSocialLogin: onSubmitSocialLogin,
    onPasswordLogin: onSubmitPasswordLogin,
  };
};

export default useLogin;
