import { useContext, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import AuthContext from '../contexts/AuthContext';
import { UPDATE_USER_PROFILE_MUTATION } from '../graphql/users';
import type { LoggedUser, UserProfile } from '../lib/user';
import { useToastNotification } from './useToastNotification';
import type { ResponseError } from '../graphql/common';
import { errorMessage, gqlClient } from '../graphql/common';
import { useDirtyForm } from './useDirtyForm';
import { ActionType } from '../graphql/actions';
import { useActions } from './useActions';
import { getCompletionItems } from '../features/profile/components/ProfileWidgets/ProfileCompletion';

export interface ProfileFormHint {
  portfolio?: string;
  username?: string;
  twitter?: string;
  github?: string;
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
  upload?: File;
  coverUpload?: File;
}

interface UseUserInfoFormOptions {
  onSuccess?: () => void;
  onError?: (error: ResponseError) => void;
  preventNavigation?: boolean;
}

interface UseUserInfoFormReturn {
  methods: UseFormReturn<UserProfile>;
  save: () => void;
  isLoading: boolean;
}

const socials = [
  'github',
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

const useUserInfoForm = ({
  onSuccess,
  onError,
  preventNavigation = true,
}: UseUserInfoFormOptions = {}): UseUserInfoFormReturn => {
  const { user, updateUser } = useContext(AuthContext);
  const { displayToast } = useToastNotification();
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();
  const router = useRouter();

  const methods = useForm<UserProfile>({
    defaultValues: {
      name: user?.name,
      username: user?.username,
      image: user?.image,
      cover: user?.cover,
      bio: user?.bio,
      github: user?.github,
      locationId: user?.location?.id,
      linkedin: user?.linkedin,
      portfolio: user?.portfolio,
      twitter: user?.twitter,
      youtube: user?.youtube,
      stackoverflow: user?.stackoverflow,
      reddit: user?.reddit,
      roadmap: user?.roadmap,
      codepen: user?.codepen,
      mastodon: user?.mastodon,
      bluesky: user?.bluesky,
      threads: user?.threads,
      experienceLevel: user?.experienceLevel,
      readme: user?.readme || '',
    },
  });

  const dirtyFormRef = useRef<ReturnType<typeof useDirtyForm> | null>(null);

  const { isPending: isLoading, mutate: updateUserProfile } = useMutation<
    LoggedUser,
    ResponseError,
    UpdateProfileParameters
  >({
    mutationFn: ({ upload, coverUpload, ...data }) =>
      gqlClient.request(UPDATE_USER_PROFILE_MUTATION, {
        data,
        upload,
        coverUpload,
      }),

    onSuccess: async (_, vars) => {
      const currentValues = methods.getValues();

      await updateUser({ ...user, ...vars });
      methods.reset(currentValues);

      dirtyFormRef.current?.allowNavigation();

      const completionItems = getCompletionItems(user);
      const isProfileComplete = completionItems.every((item) => item.completed);
      const hasCompletedAction =
        isActionsFetched && checkHasCompleted(ActionType.ProfileCompleted);

      if (isProfileComplete && !hasCompletedAction) {
        displayToast(
          'Your profile has been completed successfully. All your details are now up to date 🎉',
        );
        completeAction(ActionType.ProfileCompleted);
      } else {
        displayToast('Profile updated');
      }

      onSuccess?.();

      if (dirtyFormRef.current?.hasPendingNavigation()) {
        dirtyFormRef.current.navigateToPending();
      } else {
        const username = currentValues.username?.toLowerCase();
        if (username) {
          router.push(`/${username}`);
        }
      }
    },

    onError: (err) => {
      if (err?.response?.errors?.length) {
        try {
          const data: ProfileFormHint = JSON.parse(
            err.response.errors[0].message,
          );

          Object.entries(data).forEach(([key, value]) => {
            methods.setError(key as keyof UserProfile, {
              type: 'manual',
              message: value,
            });
          });

          if (
            Object.values(data).some((errorHint) =>
              socials.some((social) => errorHint.includes(social)),
            )
          ) {
            displayToast(errorMessage.profile.invalidSocialLinks);
          }
        } catch (parseError) {
          displayToast('Failed to update profile');
        }
      } else {
        displayToast('Failed to update profile');
      }

      onError?.(err);
    },
  });

  const dirtyForm = useDirtyForm(methods, {
    preventNavigation,
    onSave: () => {
      const formData = methods.getValues();
      updateUserProfile(formData);
    },
    onDiscard: () => {
      methods.reset();
    },
  });

  dirtyFormRef.current = dirtyForm;

  return {
    methods,
    save: dirtyForm.save,
    isLoading,
  };
};

export default useUserInfoForm;
