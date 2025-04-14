import { useContext, useEffect, useMemo, useState } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import AuthContext from '../contexts/AuthContext';
import type {
  RegistrationError,
  RegistrationParameters,
  ValidateRegistrationParams,
} from '../lib/auth';
import {
  iosNativeAuth,
  isNativeAuthSupported,
  AuthEventNames,
  errorsToJson,
  getNodeByKey,
  getNodeValue,
} from '../lib/auth';
import type {
  InitializationData,
  SuccessfulRegistrationData,
} from '../lib/kratos';
import {
  AuthEvent,
  AuthFlow,
  ContinueWithAction,
  initializeKratosFlow,
  KRATOS_ERROR,
  KRATOS_ERROR_MESSAGE,
  submitKratosFlow,
} from '../lib/kratos';
import { useToastNotification } from './useToastNotification';
import { getUserDefaultTimezone } from '../lib/timezones';
import LogContext from '../contexts/LogContext';
import { Origin } from '../lib/log';
import { LogoutReason } from '../lib/user';
import { AFTER_AUTH_PARAM } from '../components/auth/common';
import { disabledRefetch } from '../lib/func';

type ParamKeys = keyof RegistrationParameters;

interface UseRegistrationProps {
  key: QueryKey;
  onRedirect?: (redirect: string) => void;
  onRedirectFail?: () => void;
  onInvalidRegistration?: (errors: RegistrationError) => void;
  onInitializeVerification?: () => void;
  keepSession?: boolean;
}

interface UseRegistration {
  registration: InitializationData;
  isValidationIdle: boolean;
  isLoading?: boolean;
  isReady: boolean;
  validateRegistration: (values: FormParams) => Promise<void>;
  onSocialRegistration?: (provider: string) => Promise<void>;
  verificationFlowId?: string;
}

type FormParams = Omit<RegistrationParameters, 'csrf_token'>;

const EMAIL_EXISTS_ERROR_ID = KRATOS_ERROR.EXISTING_USER;

const useRegistration = ({
  key,
  onRedirect,
  onRedirectFail,
  onInvalidRegistration,
  onInitializeVerification,
  keepSession = false,
}: UseRegistrationProps): UseRegistration => {
  const { logEvent } = useContext(LogContext);
  const { displayToast } = useToastNotification();
  const [verificationId, setVerificationId] = useState<string>();
  const { trackingId, referral, referralOrigin, logout, geo } =
    useContext(AuthContext);
  const timezone = getUserDefaultTimezone();
  const {
    data: registration,
    isPending: isQueryLoading,
    error: registrationError,
  } = useQuery({
    queryKey: key,
    queryFn: () => initializeKratosFlow(AuthFlow.Registration),
    ...disabledRefetch,
  });

  if (registration?.error) {
    logEvent({
      event_name: AuthEventNames.RegistrationInitializationError,
      extra: JSON.stringify({
        error: JSON.stringify(registration.error),
        origin: Origin.InitializeRegistrationFlow,
      }),
    });
    const params = new URLSearchParams(window.location.search);
    const afterAuth = params.get(AFTER_AUTH_PARAM);
    /**
     * In case a valid session exists on kratos, but not FE we should logout the user.
     * We ignore it if 'after_auth' param exists, because it means we manually redirected the user here, and that will trigger this error.
     */
    if (
      registration.error?.id ===
        KRATOS_ERROR_MESSAGE.SESSION_ALREADY_AVAILABLE &&
      !afterAuth &&
      !keepSession
    ) {
      logout(LogoutReason.KratosSessionAlreadyAvailable);
    }
  }

  useEffect(() => {
    if (registrationError) {
      const serializedError = JSON.stringify(
        registrationError,
        Object.getOwnPropertyNames(registrationError),
      );
      logEvent({
        event_name: AuthEventNames.RegistrationInitializationError,
        extra: JSON.stringify({
          error: serializedError,
          origin: Origin.InitializeRegistrationFlow,
        }),
      });
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationError]);

  const referralTraits = useMemo(() => {
    return {
      'traits.referral': referral,
      'traits.referralOrigin': referralOrigin,
    };
  }, [referral, referralOrigin]);

  const {
    mutateAsync: validate,
    status,
    isPending: isMutationLoading,
  } = useMutation({
    mutationFn: (params: ValidateRegistrationParams) =>
      submitKratosFlow(params),

    onSuccess: ({ data, error, redirect }, params) => {
      const successfulData = data as SuccessfulRegistrationData;

      if (successfulData?.continue_with?.length) {
        const continueWith = successfulData.continue_with.find(
          ({ action }) => action === ContinueWithAction.ShowVerification,
        );

        if (continueWith) {
          setVerificationId(continueWith.flow.id);
          return onInitializeVerification?.();
        }
      }

      if (redirect) {
        return onRedirect(redirect);
      }

      // If it's native auth, we can proceed by simulating the callback page
      if (params?.params?.id_token) {
        if (successfulData?.session?.active) {
          return window.postMessage({
            eventKey: AuthEvent.SocialRegistration,
            social_registration: true,
          });
        }
        return window.postMessage({
          eventKey: AuthEvent.SocialRegistration,
          social_registration: true,
          flow: error?.id,
        });
      }

      // probably csrf token issue and definitely not related to forms data
      if (!error?.ui) {
        logEvent({
          event_name: AuthEventNames.RegistrationError,
          extra: JSON.stringify({
            error: {
              flowId: error?.id,
              messages: error?.ui?.messages,
            },
            origin: 'validate registration flow',
          }),
        });
        return displayToast('An error occurred, please refresh the page.');
      }

      const turnstileError = getNodeByKey('csrf_token', error.ui.nodes);
      const emailExists = error?.ui?.messages?.find(
        (message) => message.id === EMAIL_EXISTS_ERROR_ID,
      );
      if (turnstileError?.messages?.length > 0) {
        return onInvalidRegistration?.({
          csrf_token: 'Turnstile error',
        });
      }
      if (emailExists) {
        return onInvalidRegistration?.({
          'traits.email': 'Email is already taken!',
        });
      }

      const json = errorsToJson<ParamKeys>(error);
      return onInvalidRegistration?.(json);
    },
  });

  const onValidateRegistration = async (values: RegistrationParameters) => {
    const { nodes, action } = registration.ui;
    const postData: RegistrationParameters = {
      ...values,
      method: values.method || 'password',
      csrf_token: getNodeValue('csrf_token', nodes),
      'traits.userId': trackingId,
      ...referralTraits,
      'traits.timezone': timezone,
      'traits.region': geo?.region,
    };

    await validate({ action, params: postData });
  };

  const onSocialRegistration = async (provider: string) => {
    if (!registration?.ui) {
      logEvent({
        event_name: AuthEventNames.RegistrationError,
        extra: JSON.stringify({
          error: {
            flowId: registration?.id,
            messages: registration?.ui?.messages,
          },
          origin: 'registration ui not found',
        }),
      });
      displayToast('An error occurred, please refresh the page.');
      onRedirectFail();
      return;
    }

    const csrf = getNodeValue('csrf_token', registration.ui.nodes);
    const postData: RegistrationParameters = {
      csrf_token: csrf,
      method: 'oidc',
      provider: provider.toLowerCase(),
      'traits.email': '',
      'traits.username': '',
      'traits.name': '',
      'traits.image': '',
      'traits.userId': trackingId,
      ...referralTraits,
      'traits.timezone': timezone,
      'traits.acceptedMarketing': false,
    };

    // Native auth takes care of the actual OAuth process, so we need to send the proper params
    if (isNativeAuthSupported(provider)) {
      const res = await iosNativeAuth(provider);
      postData.id_token = res.token;
      postData.id_token_nonce = res.nonce;
      if (res.name) {
        postData['traits.name'] = res.name;
      }
    }

    await onValidateRegistration(postData);
  };

  return useMemo<UseRegistration>(
    () => ({
      isReady: !!registration?.ui,
      isLoading: isQueryLoading || isMutationLoading,
      registration,
      onSocialRegistration,
      validateRegistration: onValidateRegistration,
      isValidationIdle: status === 'idle',
      verificationFlowId: verificationId,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [registration, status, isQueryLoading, isMutationLoading, verificationId],
  );
};

export default useRegistration;
