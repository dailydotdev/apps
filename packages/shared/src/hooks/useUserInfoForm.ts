import { useContext, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import AuthContext from '../contexts/AuthContext';
import { mutateUserInfo } from '../graphql/users';
import type { LoggedUser, PublicProfile, UserProfile } from '../lib/user';
import { getProfile } from '../lib/user';
import { useToastNotification } from './useToastNotification';
import type { ResponseError } from '../graphql/common';
import { useDirtyForm } from './useDirtyForm';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import { disabledRefetch } from '../lib/func';

export interface ProfileFormHint {
  username?: string;
  name?: string;
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

const useUserInfoForm = (): UseUserInfoForm => {
  const qc = useQueryClient();
  const { user, updateUser } = useContext(AuthContext);
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const router = useRouter();

  // Fetch full profile via GraphQL to get socialLinks (boot endpoint doesn't include them)
  const userQueryKey = generateQueryKey(RequestKey.Profile, user, {
    id: user?.id,
  });
  const { data: fullProfile } = useQuery({
    queryKey: userQueryKey,
    queryFn: () => getProfile(user?.id),
    ...disabledRefetch,
    staleTime: StaleTime.OneHour,
    enabled: !!user?.id,
  });

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
      externalLocationId: user?.location?.externalId,
      experienceLevel: user?.experienceLevel,
      hideExperience: user?.hideExperience,
      readme: user?.readme || '',
      socialLinks: [],
    },
  });

  // Update socialLinks when fullProfile loads (async fetch completes)
  const hasUpdatedSocialLinks = useRef(false);
  useEffect(() => {
    if (fullProfile && !hasUpdatedSocialLinks.current) {
      hasUpdatedSocialLinks.current = true;
      methods.setValue('socialLinks', fullProfile.socialLinks || [], {
        shouldDirty: false,
      });
    }
  }, [fullProfile, methods]);

  const dirtyFormRef = useRef<ReturnType<typeof useDirtyForm> | null>(null);

  const { isPending: isLoading, mutate: updateUserProfile } = useMutation<
    LoggedUser,
    ResponseError,
    UpdateProfileParameters
  >({
    mutationFn: ({ upload, coverUpload, ...data }) =>
      mutateUserInfo(data, upload, coverUpload),

    onSuccess: async (res) => {
      const oldProfileData = qc.getQueryData<PublicProfile>(userQueryKey);
      qc.setQueryData(userQueryKey, {
        ...oldProfileData,
        ...res,
      });
      await updateUser({ ...user, ...res });
      dirtyFormRef.current?.allowNavigation();

      displayToast('Profile updated');
      methods.reset(res);
      logEvent({ event_name: LogEvent.UpdateProfile });

      if (dirtyFormRef.current?.hasPendingNavigation()) {
        dirtyFormRef.current.navigateToPending();
      } else {
        router.push(`/${res.username}`);
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
        } catch (e) {
          // If parsing fails, the error message is not in the expected format
          // Just show the generic toast
        }
        displayToast('Failed to update profile');
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
