import { useContext, useState } from 'react';
import type { UseMutateFunction } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import AuthContext from '../contexts/AuthContext';
import {
  handleRegex,
  socialHandleRegex,
  UPDATE_USER_PROFILE_MUTATION,
} from '../graphql/users';
import type { LoggedUser, UserFlagsPublic, UserProfile } from '../lib/user';
import { useToastNotification } from './useToastNotification';
import type { ResponseError } from '../graphql/common';
import { errorMessage, gqlClient } from '../graphql/common';

export interface ProfileFormHint {
  portfolio?: string;
  username?: string;
  twitter?: string;
  github?: string;
  hashnode?: string;
  name?: string;
  roadmap?: string;
  threads?: string;
  codepen?: string;
  reddit?: string;
  stackoverflow?: string;
  youtube?: string;
  linkedin?: string;
  mastodon?: string;
  bluesky?: string;
}

export interface UpdateProfileParameters extends Partial<UserProfile> {
  image?: File;
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

type Handles = Pick<
  UserProfile,
  | 'github'
  | 'hashnode'
  | 'twitter'
  | 'username'
  | 'roadmap'
  | 'threads'
  | 'codepen'
  | 'reddit'
  | 'stackoverflow'
  | 'youtube'
  | 'linkedin'
  | 'mastodon'
  | 'bluesky'
>;
const socials: Array<keyof Handles> = [
  'github',
  'hashnode',
  'twitter',
  'roadmap',
  'threads',
  'codepen',
  'reddit',
  'stackoverflow',
  'youtube',
  'linkedin',
  'mastodon',
  'bluesky',
];

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
  onError,
}: UseProfileFormProps = {}): UseProfileForm => {
  const { user, updateUser } = useContext(AuthContext);
  const { displayToast } = useToastNotification();
  const [hint, setHint] = useState<ProfileFormHint>({});
  const { isPending: isLoading, mutate: updateUserProfile } = useMutation<
    LoggedUser,
    ResponseError,
    UpdateProfileParameters
  >({
    mutationFn: ({ image, onUpdateSuccess, ...data }) =>
      gqlClient.request(UPDATE_USER_PROFILE_MUTATION, {
        data,
        upload: image,
      }),

    onSuccess: async (_, { image, onUpdateSuccess, ...vars }) => {
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

      if (
        Object.values(data).some((errorHint) =>
          socials.some((social) => errorHint.includes(social)),
        )
      ) {
        displayToast(errorMessage.profile.invalidSocialLinks);
      }

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
