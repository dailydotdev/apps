import { GraphQLError } from 'graphql-request/dist/types';
import request from 'graphql-request';
import { useContext, useState } from 'react';
import { UseMutateAsyncFunction, useMutation, useQuery } from 'react-query';
import AuthContext from '../contexts/AuthContext';
import { UPDATE_USER_PROFILE_MUTATION } from '../graphql/users';
import { apiUrl } from '../lib/config';
import { disabledRefetch } from '../lib/func';
import {
  getNodeValue,
  initializeSettings,
  KratosAuthMethod,
  updateSettings,
} from '../lib/auth';
import { LoggedUser } from '../lib/user';

interface ProfileFormHint {
  portfolio?: string;
  username?: string;
  twitter?: string;
  github?: string;
  hashnode?: string;
}

interface MutationError {
  data: unknown;
  errors: GraphQLError[];
}

interface ResponseError {
  response: MutationError;
}

interface UseProfileForm {
  hint: ProfileFormHint;
  isLoading?: boolean;
  updateUserProfile: UseMutateAsyncFunction<
    unknown,
    ResponseError,
    UpdateProfileParameters
  >;
}

export interface UpdateProfileParameters {
  image?: File;
  name: string;
  username: string;
  bio: string;
  company: string;
  title: string;
  twitter: string;
  github: string;
  hashnode: string;
  portfolio: string;
}

const useProfileForm = (): UseProfileForm => {
  const { user, session, updateUser } = useContext(AuthContext);
  const [hint, setHint] = useState<ProfileFormHint>({});
  const { data: settings } = useQuery(
    ['settings', user?.id],
    initializeSettings,
    { ...disabledRefetch },
  );
  const { mutateAsync: updateKratosProfile } = useMutation(updateSettings);
  const { isLoading, mutateAsync: updateUserProfile } = useMutation<
    LoggedUser,
    ResponseError,
    UpdateProfileParameters
  >(
    (data) =>
      request(`${apiUrl}/graphql`, UPDATE_USER_PROFILE_MUTATION, { data }),
    {
      onSuccess: async (response, { image, ...vars }) => {
        setHint({});
        const { name, username } = session.identity.traits;
        if (name !== vars.name || username !== vars.username) {
          const params = {
            'traits.email': session.identity.traits.email,
            'traits.name': name,
            'traits.image': response.image,
            'traits.username': vars.username,
            csrf_token: getNodeValue('csrf_token', settings.ui.nodes),
            method: KratosAuthMethod.Profile,
          };
          updateKratosProfile({ action: settings.ui.action, params });
        }
        await updateUser({ ...user, ...vars });
      },
      onError: (err) => {
        if (!err?.response?.errors?.length) {
          return;
        }
        const data = JSON.parse(err.response.errors[0].message);
        setHint(data);
      },
    },
  );

  return { hint, isLoading, updateUserProfile };
};

export default useProfileForm;
