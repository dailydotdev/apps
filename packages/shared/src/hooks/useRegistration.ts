import { useContext, useMemo } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import AuthContext from '../contexts/AuthContext';
import type { RegistrationError, RegistrationParameters } from '../lib/auth';
import {
  iosNativeAuth,
  isNativeAuthSupported,
  AuthEventNames,
} from '../lib/auth';
import {
  betterAuthSignUp,
  betterAuthSignInWithIdToken,
  getBetterAuthErrorMessage,
  getBetterAuthSocialRedirectData,
} from '../lib/betterAuth';
import { useToastNotification } from './useToastNotification';
import { getUserDefaultTimezone } from '../lib/timezones';
import { useLogContext } from '../contexts/LogContext';
import { webappUrl } from '../lib/constants';

interface UseRegistrationProps {
  key: QueryKey;
  onRedirect?: (redirect: string) => void;
  onRedirectFail?: () => void;
  onInvalidRegistration?: (errors: RegistrationError) => void;
  onInitializeVerification?: () => void;
  enabled?: boolean;
  params?: Record<string, string>;
  keepSession?: boolean;
}

interface UseRegistration {
  isValidationIdle: boolean;
  isLoading?: boolean;
  isReady: boolean;
  validateRegistration: (values: FormParams) => Promise<void>;
  onSocialRegistration?: (provider: string) => Promise<void>;
  verificationFlowId?: string;
}

type FormParams = Omit<RegistrationParameters, 'csrf_token'>;

const BETTER_AUTH_SIGNUP_FALLBACK_ERROR =
  "We couldn't complete sign up. If you already have an account, try signing in instead.";

const useRegistration = ({
  onRedirect,
  onInvalidRegistration,
  onInitializeVerification,
}: UseRegistrationProps): UseRegistration => {
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { referral, referralOrigin, geo, refetchBoot } =
    useContext(AuthContext);
  const timezone = getUserDefaultTimezone();

  const {
    mutateAsync: betterAuthRegister,
    status,
    isPending: isBetterAuthMutationLoading,
  } = useMutation({
    mutationFn: async (params: {
      name: string;
      email: string;
      password: string;
      turnstileToken?: string;
      username?: string;
      experienceLevel?: string;
      referral?: string;
      referralOrigin?: string;
      timezone?: string;
      region?: string;
    }) => {
      logEvent({
        event_name: 'click',
        target_type: AuthEventNames.SignUpProvider,
        target_id: 'email',
        extra: JSON.stringify({ trigger: 'registration' }),
      });
      return betterAuthSignUp({
        ...params,
      });
    },
    onSuccess: async (res) => {
      if (res.error) {
        logEvent({
          event_name: AuthEventNames.RegistrationError,
          extra: JSON.stringify({
            error: res.error,
            origin: 'betterauth signup error',
          }),
        });
        onInvalidRegistration?.({
          'traits.email': res.error,
        });
        return;
      }

      if (res.status && !res.user) {
        logEvent({
          event_name: AuthEventNames.RegistrationError,
          extra: JSON.stringify({
            error: BETTER_AUTH_SIGNUP_FALLBACK_ERROR,
            origin: 'betterauth signup fallback error',
          }),
        });
        onInvalidRegistration?.({
          'traits.email': BETTER_AUTH_SIGNUP_FALLBACK_ERROR,
        });
        return;
      }

      onInitializeVerification?.();
    },
  });

  const onValidateRegistration = async (
    values: RegistrationParameters & {
      headers?: Record<string, string>;
    },
  ) => {
    const turnstileToken = values.headers?.['True-Client-Ip'];
    await betterAuthRegister({
      name: values['traits.name'] as string,
      email: values['traits.email'] as string,
      password: values.password as string,
      turnstileToken,
      username: values['traits.username'] as string,
      experienceLevel: values['traits.experienceLevel'] as string,
      referral: referral ?? undefined,
      referralOrigin: referralOrigin ?? undefined,
      timezone,
      region: geo?.region,
    });
  };

  const onSocialRegistration = async (provider: string) => {
    const additionalData = { timezone };

    if (isNativeAuthSupported(provider)) {
      const res = await iosNativeAuth(provider);
      if (!res) {
        return;
      }
      const result = await betterAuthSignInWithIdToken({
        provider: provider.toLowerCase(),
        token: res.token,
        nonce: res.nonce,
        additionalData,
      });
      if (result.error) {
        logEvent({
          event_name: AuthEventNames.RegistrationError,
          extra: JSON.stringify({
            error: result.error,
            origin: 'betterauth native id token registration',
          }),
        });
        return;
      }
      try {
        const { data: boot } = await refetchBoot();
        if (!boot.user) {
          logEvent({
            event_name: AuthEventNames.RegistrationError,
            extra: JSON.stringify({
              error: 'Missing user after Better Auth social registration',
              origin: 'betterauth native id token registration boot',
            }),
          });
          displayToast('An error occurred, please refresh the page.');
          return;
        }
      } catch (error) {
        logEvent({
          event_name: AuthEventNames.RegistrationError,
          extra: JSON.stringify({
            error: getBetterAuthErrorMessage(
              error,
              'Failed to refresh Better Auth registration state',
            ),
            origin: 'betterauth native id token registration boot',
          }),
        });
        displayToast('An error occurred, please refresh the page.');
        return;
      }
      return;
    }
    const callbackURL = `${webappUrl}callback?login=true`;
    const { url, error } = await getBetterAuthSocialRedirectData(
      provider.toLowerCase(),
      callbackURL,
      additionalData,
    );
    if (onRedirect && url) {
      onRedirect(url);
    } else if (!onRedirect && url) {
      logEvent({
        event_name: AuthEventNames.RegistrationError,
        extra: JSON.stringify({
          error: 'Missing social registration redirect handler',
          origin: 'betterauth social url registration',
        }),
      });
    } else if (!url) {
      logEvent({
        event_name: AuthEventNames.RegistrationError,
        extra: JSON.stringify({
          error: error || 'Failed to get social registration URL',
          origin: 'betterauth social url registration',
        }),
      });
    }
  };

  return useMemo<UseRegistration>(
    () => ({
      isReady: true,
      isLoading: isBetterAuthMutationLoading,
      onSocialRegistration,
      validateRegistration: onValidateRegistration,
      isValidationIdle: status === 'idle',
      verificationFlowId: undefined,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, isBetterAuthMutationLoading],
  );
};

export default useRegistration;
