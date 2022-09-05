import { useContext, useMemo } from 'react';
import { QueryKey, useMutation, useQuery } from 'react-query';
import AuthContext from '../contexts/AuthContext';
import {
  errorsToJson,
  RegistrationError,
  RegistrationParameters,
  getNodeValue,
  ValidateRegistrationParams,
} from '../lib/auth';
import { disabledRefetch } from '../lib/func';
import {
  AuthFlow,
  InitializationData,
  initializeKratosFlow,
  submitKratosFlow,
  SuccessfulRegistrationData,
} from '../lib/kratos';

type ParamKeys = keyof RegistrationParameters;

interface UseRegistrationProps {
  key: QueryKey;
  onRedirect?: (redirect: string) => void;
  onValidRegistration?: (params: ValidateRegistrationParams) => void;
  onInvalidRegistration?: (errors: RegistrationError) => void;
}

interface UseRegistration {
  registration: InitializationData;
  isValidationIdle: boolean;
  isLoading?: boolean;
  validateRegistration: (values: FormParams) => Promise<void>;
  onSocialRegistration?: (provider: string) => void;
}

type FormParams = Omit<RegistrationParameters, 'csrf_token'>;

const EMAIL_EXISTS_ERROR_ID = 4000007;

const useRegistration = ({
  key,
  onRedirect,
  onValidRegistration,
  onInvalidRegistration,
}: UseRegistrationProps): UseRegistration => {
  const { trackingId } = useContext(AuthContext);
  const { data: registration, isLoading: isQueryLoading } = useQuery(
    key,
    () => initializeKratosFlow(AuthFlow.Registration),
    { ...disabledRefetch },
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
          return null;
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
      'traits.image': values['traits.image'],
      'traits.userId': trackingId,
    };

    validate({ action, params: postData });
  };

  const onSocialRegistration = (provider: string) => {
    const csrf = getNodeValue('csrf_token', registration.ui.nodes);
    const postData: RegistrationParameters = {
      csrf_token: csrf,
      method: 'oidc',
      provider,
      'traits.email': '',
      'traits.username': '',
      'traits.name': '',
      'traits.image': '',
    };

    onValidateRegistration(postData);
  };

  return useMemo(
    () => ({
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
