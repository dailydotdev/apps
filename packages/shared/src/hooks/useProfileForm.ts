import { useContext, useState } from 'react';
import type { UseMutateFunction } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import AuthContext from '../contexts/AuthContext';
import { handleRegex, UPDATE_USER_PROFILE_MUTATION } from '../graphql/users';
import type { LoggedUser, UserFlagsPublic, UserProfile } from '../lib/user';
import type { ResponseError } from '../graphql/common';
import { errorMessage, gqlClient } from '../graphql/common';

export interface ProfileFormHint {
  username?: string;
  name?: string;
}

export interface UpdateProfileParameters extends Partial<UserProfile> {
  upload?: File;
  coverUpload?: File;
  onUpdateSuccess?: () => void;
  flags?: UserFlagsPublic;
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
  onError?: (error: ResponseError) => void;
}

type Handles = Pick<UserProfile, 'username'>;

export const onValidateHandles = (
  before: Partial<Handles>,
  after: Partial<Handles>,
): Partial<Record<keyof Handles, string>> => {
  if (after.username && after.username !== before.username) {
    if (after.username.length > 38) {
      return { username: errorMessage.profile.usernameLength };
    }
    const isValid = handleRegex.test(after.username);

    if (!isValid) {
      return { username: errorMessage.profile.invalidUsername };
    }
  } else if ('username' in after && !after.username) {
    return { username: errorMessage.profile.invalidUsername };
  }

  return {};
};

/**
 * @deprecated Use useUserInfoForm instead
 */
const useProfileForm = ({
  onSuccess,
  onError,
}: UseProfileFormProps = {}): UseProfileForm => {
  const { user, updateUser } = useContext(AuthContext);
  const [hint, setHint] = useState<ProfileFormHint>({});
  const { isPending: isLoading, mutate: updateUserProfile } = useMutation<
    LoggedUser,
    ResponseError,
    UpdateProfileParameters
  >({
    mutationFn: ({ upload, coverUpload, onUpdateSuccess, ...data }) =>
      gqlClient.request(UPDATE_USER_PROFILE_MUTATION, {
        data,
        upload,
        coverUpload,
      }),

    onSuccess: async (_, { onUpdateSuccess, ...vars }) => {
      setHint({});
      await updateUser({ ...user, ...vars });
      onUpdateSuccess?.();
      onSuccess?.();
    },
    onError: (err) => {
      onError?.(err);

      if (!err?.response?.errors?.length) {
        return;
      }

      const data: ProfileFormHint = JSON.parse(err.response.errors[0].message);
      setHint(data);
    },
  });

  return {
    hint,
    isLoading,
    onUpdateHint: setHint,
    updateUserProfile,
  };
};

export default useProfileForm;
