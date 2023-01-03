import { GraphQLError } from 'graphql-request/dist/types';
import request from 'graphql-request';
import { useContext, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { UseMutateFunction } from 'react-query/types/react/types';
import AuthContext from '../contexts/AuthContext';
import { UPDATE_USER_PROFILE_MUTATION } from '../graphql/users';
import { apiUrl } from '../lib/config';
import { LoggedUser, UserProfile } from '../lib/user';

export interface ProfileFormHint {
  portfolio?: string;
  username?: string;
  twitter?: string;
  github?: string;
  hashnode?: string;
  name?: string;
}

interface MutationError {
  data: unknown;
  errors: GraphQLError[];
}

interface ResponseError {
  response: MutationError;
}

export interface UpdateProfileParameters extends Partial<UserProfile> {
  image?: File;
}

interface UseProfileForm {
  hint: ProfileFormHint;
  onUpdateHint?: (hint: Partial<ProfileFormHint>) => void;
  isLoading?: boolean;
  updateUserProfile: UseMutateFunction<
    LoggedUser,
    ResponseError,
    UpdateProfileParameters
  >;
}

interface UseProfileFormProps {
  onSuccess?: () => void;
}

const useProfileForm = ({
  onSuccess,
}: UseProfileFormProps = {}): UseProfileForm => {
  const { user, updateUser } = useContext(AuthContext);
  const [hint, setHint] = useState<ProfileFormHint>({});
  const { isLoading, mutate: updateUserProfile } = useMutation<
    LoggedUser,
    ResponseError,
    UpdateProfileParameters
  >(
    ({ image, ...data }) =>
      request(`${apiUrl}/graphql`, UPDATE_USER_PROFILE_MUTATION, {
        data,
        upload: image,
      }),
    {
      onSuccess: async (_, { image, ...vars }) => {
        setHint({});
        await updateUser({ ...user, ...vars });
        onSuccess?.();
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

  return useMemo(
    () => ({ hint, isLoading, onUpdateHint: setHint, updateUserProfile }),
    [user, hint, isLoading],
  );
};

export default useProfileForm;
