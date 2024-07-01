import request from 'graphql-request';
import { useCallback, useContext, useState } from 'react';
import { UseMutateFunction, useMutation } from '@tanstack/react-query';
import AuthContext from '../contexts/AuthContext';
import {
  handleRegex,
  socialHandleRegex,
  UPDATE_USER_PROFILE_MUTATION,
} from '../graphql/users';
import { graphqlUrl } from '../lib/config';
import { LoggedUser, UserProfile } from '../lib/user';
import { useToastNotification } from './useToastNotification';
import { errorMessage, ResponseError } from '../graphql/common';

export interface ProfileFormHint {
  portfolio?: string;
  username?: string;
  twitter?: string;
  github?: string;
  hashnode?: string;
  name?: string;
}

export interface UpdateProfileParameters extends Partial<UserProfile> {
  image?: File;
  onUpdateSuccess?: () => void;
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

type Handles = Pick<
  UserProfile,
  'github' | 'hashnode' | 'twitter' | 'username'
>;
const socials: Array<keyof Handles> = ['github', 'hashnode', 'twitter'];

export const onValidateHandles = (
  before: Partial<Handles>,
  after: Partial<Handles>,
): Partial<Record<keyof Handles, string>> => {
  if (after.username && after.username !== before.username) {
    const isValid = handleRegex.test(after.username);

    if (!isValid) {
      return { username: errorMessage.profile.invalidUsername };
    }
  } else if ('username' in after && !after.username) {
    return { username: errorMessage.profile.invalidUsername };
  }

  return socials.reduce((obj, social) => {
    if (after[social] && after[social] === before[social]) {
      return obj;
    }

    const isValid = socialHandleRegex.test(after[social]);

    if (isValid) {
      return obj;
    }

    return {
      ...obj,
      [social]: errorMessage.profile.invalidHandle,
    };
  }, {});
};

const useProfileForm = ({
  onSuccess,
}: UseProfileFormProps = {}): UseProfileForm => {
  const { user, updateUser } = useContext(AuthContext);
  const { displayToast } = useToastNotification();
  const [hint, setHint] = useState<ProfileFormHint>({});
  const { isLoading, mutate: updateUserProfile } = useMutation<
    LoggedUser,
    ResponseError,
    UpdateProfileParameters
  >(
    ({ image, onUpdateSuccess, ...data }) =>
      request(graphqlUrl, UPDATE_USER_PROFILE_MUTATION, {
        data,
        upload: image,
      }),
    {
      onSuccess: async (_, { image, onUpdateSuccess, ...vars }) => {
        setHint({});
        await updateUser({ ...user, ...vars });
        onUpdateSuccess?.();
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

  const handleUpdate: typeof updateUserProfile = useCallback(
    (values) => {
      const error = onValidateHandles(user, values);
      const message = Object.values(error)[0];

      if (message) {
        return displayToast(message);
      }

      return updateUserProfile(values);
    },
    [displayToast, user, updateUserProfile],
  );

  return {
    hint,
    isLoading,
    onUpdateHint: setHint,
    updateUserProfile: handleUpdate,
  };
};

export default useProfileForm;
