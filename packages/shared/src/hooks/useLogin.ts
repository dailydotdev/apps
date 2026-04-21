import { useCallback, useContext, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type {
  LoginFormParams,
  LoginHintState,
} from '../components/auth/LoginForm';
import AuthContext from '../contexts/AuthContext';
import {
  AuthEvent,
  AuthEventNames,
  iosNativeAuth,
  isNativeAuthSupported,
} from '../lib/auth';
import {
  betterAuthSignIn,
  betterAuthSignInWithIdToken,
  getBetterAuthErrorMessage,
  getBetterAuthSocialRedirectData,
} from '../lib/betterAuth';
import { useLogContext } from '../contexts/LogContext';
import { useToastNotification } from './useToastNotification';
import type { SignBackProvider } from './auth/useSignBack';
import { useSignBack } from './auth/useSignBack';
import type { LoggedUser } from '../lib/user';
import { labels } from '../lib';
import { Origin } from '../lib/log';
import { useEventListener } from './useEventListener';
import { broadcastChannel, webappUrl } from '../lib/constants';
import { shouldUseSocialAuthPopup } from '../lib/func';

interface UseLogin {
  isPasswordLoginLoading?: boolean;
  loginHint?: LoginHintState;
  isReady: boolean;
  onSocialLogin: (provider: string) => void;
  onPasswordLogin: (params: LoginFormParams) => void;
}

interface UseLoginProps {
  trigger?: string;
  provider?: string;
  onSuccessfulLogin?:
    | (() => Promise<void>)
    | ((shouldVerify?: boolean) => void);
}

const useLogin = ({
  trigger,
  provider: providerProp,
  onSuccessfulLogin,
}: UseLoginProps = {}): UseLogin => {
  const { onUpdateSignBack } = useSignBack();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { refetchBoot } = useContext(AuthContext);
  const hintState = useState<string | null>('Enter your password to login');
  const [, setHint] = hintState;

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
        turnstileToken: form.turnstileToken,
      });
    },
    onSuccess: async (res) => {
      if (res.error) {
        logEvent({
          event_name: AuthEventNames.LoginError,
          extra: JSON.stringify({
            error: res.error,
            displayedError: labels.auth.error.invalidEmailOrPassword,
            origin: Origin.BetterAuthEmailLogin,
            userAgent: navigator.userAgent,
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
              origin: Origin.BetterAuthEmailLoginBoot,
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
            origin: Origin.BetterAuthEmailLoginBoot,
          }),
        });
        setHint(labels.auth.error.generic);
      }
    },
  });

  const onSubmitSocialLogin = useCallback(
    async (provider: string) => {
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
              origin: Origin.BetterAuthNativeIdToken,
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
                origin: Origin.BetterAuthNativeIdTokenBoot,
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
              origin: Origin.BetterAuthNativeIdTokenBoot,
            }),
          });
          displayToast(labels.auth.error.generic);
        }
        return;
      }
      const shouldUsePopup = shouldUseSocialAuthPopup();
      const socialPopup = shouldUsePopup ? window.open() : null;
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
            origin: Origin.BetterAuthSocialUrl,
          }),
        });
        socialPopup?.close();
        displayToast(labels.auth.error.generic);
        return;
      }
      if (socialPopup) {
        socialPopup.location.href = socialUrl;
        return;
      }
      window.location.href = socialUrl;
    },
    [displayToast, logEvent, refetchBoot, onUpdateSignBack],
  );

  const onSubmitPasswordLogin = useCallback(
    (form: LoginFormParams) => {
      onBetterAuthPasswordLogin(form);
    },
    [onBetterAuthPasswordLogin],
  );

  const onLoginMessage = async (e: MessageEvent) => {
    if (e.data?.eventKey !== AuthEvent.Login) {
      return;
    }

    const { data: boot } = await refetchBoot();

    if (boot.user) {
      onUpdateSignBack(
        boot.user as LoggedUser,
        providerProp as SignBackProvider,
      );
    }

    onSuccessfulLogin?.();
  };

  useEventListener(globalThis, 'message', onLoginMessage);

  useEventListener(broadcastChannel, 'message', onLoginMessage);

  return {
    loginHint: hintState,
    isPasswordLoginLoading: isBetterAuthPasswordLoading,
    isReady: true,
    onSocialLogin: onSubmitSocialLogin,
    onPasswordLogin: onSubmitPasswordLogin,
  };
};

export default useLogin;
