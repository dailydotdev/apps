import { useMemo } from 'react';
import { QueryKey, useMutation, useQuery } from 'react-query';
import {
  AuthSession,
  errorsToJson,
  initializeRegistration,
  RegistrationError,
  RegistrationInitializationData,
  RegistrationParameters,
  validateRegistration,
  ValidateRegistrationParams,
} from '../lib/auth';
import { disabledRefetch } from '../lib/func';

type ParamKeys = keyof RegistrationParameters;

interface UseRegistrationProps {
  key: QueryKey;
  onValidRegistration?: (
    session: AuthSession,
    params: ValidateRegistrationParams,
  ) => void;
  onInvalidRegistration?: (errors: RegistrationError) => void;
}

interface UseRegistration {
  registration: RegistrationInitializationData;
  isValidationIdle: boolean;
  isLoading?: boolean;
  validateRegistration: (values: FormParams) => Promise<void>;
}

type FormParams = Omit<RegistrationParameters, 'csrf_token' | 'method'>;

const EMAIL_EXISTS_ERROR_ID = 4000007;

const useRegistration = ({
  key,
  onValidRegistration,
  onInvalidRegistration,
}: UseRegistrationProps): UseRegistration => {
  const { data: registration, isLoading: isQueryLoading } = useQuery(
    key,
    initializeRegistration,
    { ...disabledRefetch },
  );
  const {
    mutateAsync: validate,
    status,
    isLoading: isMutationLoading,
  } = useMutation(validateRegistration, {
    onSuccess: ({ data, error }, params) => {
      if (data) {
        return onValidRegistration(data.session, params);
      }

      // probably csrf token issue and definitely not related to forms data
      if (!error.ui) {
        return null;
      }

      const emailExists = error?.ui?.messages?.find(
        (message) => message.id === EMAIL_EXISTS_ERROR_ID,
      );
      if (emailExists) {
        return onInvalidRegistration({
          'traits.email': 'Email is already taken!',
        });
      }

      const json = errorsToJson<ParamKeys>(error);
      return onInvalidRegistration(json);
    },
  });

  const onValidateRegistration = async (values: FormParams) => {
    const { nodes, action } = registration.ui;
    const csrfToken = nodes[0].attributes.value;
    const postData: RegistrationParameters = {
      ...values,
      csrf_token: csrfToken,
      method: 'password',
    };

    validate({ action, params: postData });
  };

  return useMemo(
    () => ({
      isLoading: isQueryLoading || isMutationLoading,
      registration,
      validateRegistration: onValidateRegistration,
      isValidationIdle: status === 'idle',
    }),
    [registration, status, isQueryLoading, isMutationLoading],
  );
};

export default useRegistration;
