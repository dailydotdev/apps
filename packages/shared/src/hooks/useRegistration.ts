import { useContext, useEffect, useMemo, useState } from 'react';
import { QueryKey, useMutation, useQuery } from '@tanstack/react-query';
import AuthContext from '../contexts/AuthContext';
import {
  AuthEventNames,
  errorsToJson,
  getNodeValue,
  RegistrationError,
  RegistrationParameters,
  ValidateRegistrationParams,
} from '../lib/auth';
import {
  AuthFlow,
  ContinueWithAction,
  InitializationData,
  initializeKratosFlow,
  KRATOS_ERROR,
  KRATOS_ERROR_MESSAGE,
  submitKratosFlow,
  SuccessfulRegistrationData,
} from '../lib/kratos';
import { useToastNotification } from './useToastNotification';
import { getUserDefaultTimezone } from '../lib/timezones';
import LogContext from '../contexts/LogContext';
import { Origin } from '../lib/log';
import { LogoutReason } from '../lib/user';

type ParamKeys = keyof RegistrationParameters;

interface UseRegistrationProps {
  key: QueryKey;
  onRedirect?: (redirect: string) => void;
  onRedirectFail?: () => void;
  onValidRegistration?: (params: ValidateRegistrationParams) => void;
  onInvalidRegistration?: (errors: RegistrationError) => void;
  onInitializeVerification?: () => void;
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
  onValidRegistration,
  onInvalidRegistration,
  onInitializeVerification,
}: UseRegistrationProps): UseRegistration => {
  const { logEvent } = useContext(LogContext);
  const { displayToast } = useToastNotification();
  const [verificationId, setVerificationId] = useState<string>();
  const { trackingId, referral, referralOrigin, logout } =
    useContext(AuthContext);
  const timezone = getUserDefaultTimezone();
  const {
    data: registration,
    isLoading: isQueryLoading,
    error: registrationError,
  } = useQuery(key, () => initializeKratosFlow(AuthFlow.Registration), {
    refetchOnWindowFocus: false,
  });

  if (registration?.error) {
    logEvent({
      event_name: AuthEventNames.RegistrationInitializationError,
      extra: JSON.stringify({
        error: JSON.stringify(registration.error),
        origin: Origin.InitializeRegistrationFlow,
      }),
    });
    /**
     * In case a valid session exists on kratos, but not FE we should logout the user
     */
    if (
      registration.error?.id === KRATOS_ERROR_MESSAGE.SESSION_ALREADY_AVAILABLE
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
    isLoading: isMutationLoading,
  } = useMutation(
    (params: ValidateRegistrationParams) => submitKratosFlow(params),
    {
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

        if (successfulData) {
          return onValidRegistration?.(params);
        }

        if (redirect) {
          return onRedirect(redirect);
        }

        // probably csrf token issue and definitely not related to forms data
        if (!error.ui) {
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

        const emailExists = error?.ui?.messages?.find(
          (message) => message.id === EMAIL_EXISTS_ERROR_ID,
        );
        if (emailExists) {
          return onInvalidRegistration?.({
            'traits.email': 'Email is already taken!',
          });
        }

        const json = errorsToJson<ParamKeys>(error);
        return onInvalidRegistration?.(json);
      },
    },
  );

  const onValidateRegistration = async (values: RegistrationParameters) => {
    const { nodes, action } = registration.ui;
    const postData: RegistrationParameters = {
      ...values,
      method: values.method || 'password',
      csrf_token: getNodeValue('csrf_token', nodes),
      'traits.userId': trackingId,
      ...referralTraits,
      'traits.timezone': timezone,
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
