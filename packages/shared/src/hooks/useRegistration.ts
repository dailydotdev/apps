import { useContext, useMemo } from 'react';
import { QueryKey, useMutation, useQuery } from 'react-query';
import AuthContext from '../contexts/AuthContext';
import {
  errorsToJson,
  RegistrationError,
  RegistrationParameters,
  getNodeValue,
  ValidateRegistrationParams,
  AuthEventNames,
} from '../lib/auth';
import {
  AuthFlow,
  InitializationData,
  initializeKratosFlow,
  submitKratosFlow,
  SuccessfulRegistrationData,
} from '../lib/kratos';
import { useToastNotification } from './useToastNotification';
import { getUserDefaultTimezone } from '../lib/timezones';
import AnalyticsContext from '../contexts/AnalyticsContext';

type ParamKeys = keyof RegistrationParameters;

interface UseRegistrationProps {
  key: QueryKey;
  onRedirect?: (redirect: string) => void;
  onRedirectFail?: () => void;
  onValidRegistration?: (params: ValidateRegistrationParams) => void;
  onInvalidRegistration?: (errors: RegistrationError) => void;
}

interface UseRegistration {
  registration: InitializationData;
  isValidationIdle: boolean;
  isLoading?: boolean;
  isReady: boolean;
  validateRegistration: (values: FormParams) => Promise<void>;
  onSocialRegistration?: (provider: string) => void;
}

type FormParams = Omit<RegistrationParameters, 'csrf_token'>;

const EMAIL_EXISTS_ERROR_ID = 4000007;

const useRegistration = ({
  key,
  onRedirect,
  onRedirectFail,
  onValidRegistration,
  onInvalidRegistration,
}: UseRegistrationProps): UseRegistration => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { displayToast } = useToastNotification();
  const { trackingId, referral } = useContext(AuthContext);
  const timezone = getUserDefaultTimezone();
  const { data: registration, isLoading: isQueryLoading } = useQuery(
    key,
    () => initializeKratosFlow(AuthFlow.Registration),
    { refetchOnWindowFocus: false },
  );
  const {
    mutateAsync: validate,
    status,
    isLoading: isMutationLoading,
  } = useMutation(
    (params: ValidateRegistrationParams) => submitKratosFlow(params),
    {
      onSuccess: ({ data, error, redirect }, params) => {
        const successfulData = data as SuccessfulRegistrationData;
        if (successfulData) {
          return onValidRegistration?.(params);
        }

        if (redirect) {
          return onRedirect(redirect);
        }

        // probably csrf token issue and definitely not related to forms data
        if (!error.ui) {
          trackEvent({
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
      'traits.referral': referral,
      'traits.timezone': timezone,
    };

    validate({ action, params: postData });
  };

  const onSocialRegistration = (provider: string) => {
    if (!registration?.ui) {
      trackEvent({
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
      'traits.referral': referral,
      'traits.timezone': timezone,
      'traits.acceptedMarketing': false,
    };

    onValidateRegistration(postData);
  };

  return useMemo<UseRegistration>(
    () => ({
      isReady: !!registration?.ui,
      isLoading: isQueryLoading || isMutationLoading,
      registration,
      onSocialRegistration,
      validateRegistration: onValidateRegistration,
      isValidationIdle: status === 'idle',
    }),
    [registration, status, isQueryLoading, isMutationLoading],
  );
};

export default useRegistration;
