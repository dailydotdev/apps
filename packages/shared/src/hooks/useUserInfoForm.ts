import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { UPDATE_USER_INFO_MUTATION } from '../graphql/users';
import type { LoggedUser, UserProfile } from '../lib/user';
import { useToastNotification } from './useToastNotification';
import type { ResponseError } from '../graphql/common';
import { errorMessage, gqlClient } from '../graphql/common';
import { useDirtyForm } from './useDirtyForm';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent } from '../lib/log';

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

export type UpdateProfileParameters = Partial<UserProfile> & {
  upload?: File;
  coverUpload?: File;
};

interface UseUserInfoForm {
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

const useUserInfoForm = (): UseUserInfoForm => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window?.location?.search);
    const field = searchParams?.get('field');
    if (field) {
      const element = document?.getElementsByName(field)[0];
      if (element) {
        element.focus();
      }
    }
  }, []);

  const methods = useForm<UserProfile>({
    defaultValues: {
      name: user?.name,
      username: user?.username,
      image: user?.image,
      cover: user?.cover,
      bio: user?.bio,
      github: user?.github,
      externalLocationId: user?.location?.externalId,
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
      gqlClient.request(UPDATE_USER_INFO_MUTATION, {
        data,
        upload,
        coverUpload,
      }),

    onSuccess: async (_, vars) => {
      dirtyFormRef.current?.allowNavigation();

      displayToast('Profile updated');
      methods.reset(vars);
      logEvent({ event_name: LogEvent.UpdateProfile });

      if (dirtyFormRef.current?.hasPendingNavigation()) {
        dirtyFormRef.current.navigateToPending();
      } else {
        router.push(`/${vars.username}`).then(() => {
          router.reload();
        });
      }
    },

    onError: (err) => {
      if (err?.response?.errors?.length) {
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
      } else {
        displayToast('Failed to update profile');
      }
    },
  });

  const dirtyForm = useDirtyForm(methods.formState.isDirty, {
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
