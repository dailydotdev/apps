import { useCallback, useContext, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { LoginFormParams } from '../components/auth/LoginForm';
import AuthContext from '../contexts/AuthContext';
import type {
  LoginPasswordParameters,
  LoginSocialParameters,
  ValidateLoginParams,
} from '../lib/auth';
import {
  AuthEventNames,
  getNodeValue,
  iosNativeAuth,
  isNativeAuthSupported,
} from '../lib/auth';
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
import {
  betterAuthSignIn,
  betterAuthSignInWithIdToken,
  getBetterAuthSocialUrl,
} from '../lib/betterAuth';
import { useIsBetterAuth } from './useIsBetterAuth';
import { useLogContext } from '../contexts/LogContext';
import { useToastNotification } from './useToastNotification';
import type { SignBackProvider } from './auth/useSignBack';
import { useSignBack } from './auth/useSignBack';
import type { LoggedUser } from '../lib/user';
import { labels } from '../lib';
import { useEventListener } from './useEventListener';
import { broadcastChannel, webappUrl } from '../lib/constants';
import { isIOSNative } from '../lib/func';

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
  const isBetterAuth = useIsBetterAuth();
  const { onUpdateSignBack } = useSignBack();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { refetchBoot } = useContext(AuthContext);
  const hintState = useState('Enter your password to login');
  const [, setHint] = hintState;
  const { data: login } = useQuery({
    queryKey: [AuthEvent.Login, { ...queryParams }],
    queryFn: () => initializeKratosFlow(AuthFlow.Login, queryParams),
    enabled: queryEnabled && !isBetterAuth,
    refetchOnWindowFocus: false,
  });

  const {
    mutateAsync: onBetterAuthPasswordLogin,
    isPending: isBetterAuthPasswordLoading,
  } = useMutation({
    mutationFn: async (form: LoginFormParams) => {
      logEvent({
        event_name: 'click',
        target_type: AuthEventNames.LoginProvider,
        target_id: 'email',
        extra: JSON.stringify({ trigger }),
      });
      return betterAuthSignIn({
        email: form.identifier,
        password: form.password,
      });
    },
    onSuccess: async (res) => {
      if (res.error) {
        logEvent({
          event_name: AuthEventNames.LoginError,
          extra: JSON.stringify({
            error: labels.auth.error.invalidEmailOrPassword,
          }),
        });
        setHint(labels.auth.error.invalidEmailOrPassword);
        return;
      }

      const { data: boot } = await refetchBoot();

      if (boot.user && !boot.user.shouldVerify) {
        onUpdateSignBack(boot.user as LoggedUser, 'password');
      }

      onSuccessfulLogin?.(boot?.user?.shouldVerify);
    },
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
    async (provider: string) => {
      if (isBetterAuth) {
        if (isNativeAuthSupported(provider)) {
          const res = await iosNativeAuth(provider);
          if (!res) {
            return;
          }
          const result = await betterAuthSignInWithIdToken({
            provider: provider.toLowerCase(),
            token: res.token,
            nonce: res.nonce,
          });
          if (result.error) {
            return;
          }
          const { data: boot } = await refetchBoot();
          if (boot.user) {
            onUpdateSignBack(
              boot.user as LoggedUser,
              provider as SignBackProvider,
            );
          }
          return;
        }
        const isIOSApp = isIOSNative();
        const callbackURL = isIOSApp
          ? `${webappUrl}callback?login=true&ios=true`
          : `${webappUrl}callback?login=true`;
        const socialUrl = await getBetterAuthSocialUrl(provider, callbackURL);
        if (socialUrl) {
          if (isIOSApp) {
            window.location.href = socialUrl;
          } else {
            window.open(socialUrl);
          }
        }
        return;
      }

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
    [
      isBetterAuth,
      displayToast,
      login?.ui,
      onSocialLogin,
      refetchBoot,
      onUpdateSignBack,
    ],
  );

  const onSubmitPasswordLogin = useCallback(
    (form: LoginFormParams) => {
      if (isBetterAuth) {
        onBetterAuthPasswordLogin(form);
        return;
      }

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
    [
      isBetterAuth,
      onBetterAuthPasswordLogin,
      displayToast,
      login?.ui,
      onPasswordLogin,
    ],
  );

  const onLoginMessage = async (e: MessageEvent) => {
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
  };

  useEventListener(globalThis, 'message', onLoginMessage);

  useEventListener(broadcastChannel, 'message', onLoginMessage);

  return {
    loginHint: hintState,
    isPasswordLoginLoading: isBetterAuth
      ? isBetterAuthPasswordLoading
      : isLoading,
    isReady: isBetterAuth ? true : !!login?.ui,
    onSocialLogin: onSubmitSocialLogin,
    onPasswordLogin: onSubmitPasswordLogin,
  };
};

export default useLogin;
