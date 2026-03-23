import { useCallback, useContext, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  LoginFormParams,
  LoginHintState,
} from '../components/auth/LoginForm';
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
  getBetterAuthErrorMessage,
  getBetterAuthSocialRedirectData,
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
  loginHint?: LoginHintState;
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
  const hintState = useState<string | null>('Enter your password to login');
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
            error: res.error,
            displayedError: labels.auth.error.invalidEmailOrPassword,
            origin: 'betterauth email login',
          }),
        });
        setHint(labels.auth.error.invalidEmailOrPassword);
        return;
      }

      try {
        const { data: boot } = await refetchBoot();

        if (!boot.user) {
          logEvent({
            event_name: AuthEventNames.LoginError,
            extra: JSON.stringify({
              error: 'Missing user after Better Auth email login',
              origin: 'betterauth email login boot',
            }),
          });
          setHint(labels.auth.error.generic);
          return;
        }

        if (!boot.user.shouldVerify) {
          onUpdateSignBack(boot.user as LoggedUser, 'password');
        }

        onSuccessfulLogin?.(boot.user.shouldVerify);
      } catch (error) {
        logEvent({
          event_name: AuthEventNames.LoginError,
          extra: JSON.stringify({
            error: getBetterAuthErrorMessage(
              error,
              'Failed to refresh Better Auth login state',
            ),
            origin: 'betterauth email login boot',
          }),
        });
        setHint(labels.auth.error.generic);
      }
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
            logEvent({
              event_name: AuthEventNames.LoginError,
              extra: JSON.stringify({
                error: result.error,
                origin: 'betterauth native id token',
              }),
            });
            return;
          }
          try {
            const { data: boot } = await refetchBoot();
            if (!boot.user) {
              logEvent({
                event_name: AuthEventNames.LoginError,
                extra: JSON.stringify({
                  error: 'Missing user after Better Auth social login',
                  origin: 'betterauth native id token boot',
                }),
              });
              displayToast(labels.auth.error.generic);
              return;
            }
            onUpdateSignBack(
              boot.user as LoggedUser,
              provider as SignBackProvider,
            );
          } catch (error) {
            logEvent({
              event_name: AuthEventNames.LoginError,
              extra: JSON.stringify({
                error: getBetterAuthErrorMessage(
                  error,
                  'Failed to refresh Better Auth social login state',
                ),
                origin: 'betterauth native id token boot',
              }),
            });
            displayToast(labels.auth.error.generic);
          }
          return;
        }
        const isIOSApp = isIOSNative();
        const socialPopup = isIOSApp ? null : window.open();
        const callbackURL = `${webappUrl}callback?login=true`;
        const { url: socialUrl, error } = await getBetterAuthSocialRedirectData(
          provider,
          callbackURL,
        );
        if (!socialUrl) {
          logEvent({
            event_name: AuthEventNames.LoginError,
            extra: JSON.stringify({
              error: error || 'Failed to get social login URL',
              origin: 'betterauth social url',
            }),
          });
          socialPopup?.close();
          displayToast(labels.auth.error.generic);
          return;
        }
        if (isIOSApp) {
          window.location.href = socialUrl;
          return;
        }
        if (socialPopup) {
          socialPopup.location.href = socialUrl;
          return;
        }
        logEvent({
          event_name: AuthEventNames.LoginError,
          extra: JSON.stringify({
            error: 'Failed to open social login window',
            origin: 'betterauth social popup',
          }),
        });
        displayToast(labels.auth.error.generic);
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
      logEvent,
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
