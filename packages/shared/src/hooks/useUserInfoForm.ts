import { useCallback, useContext, useEffect, useRef } from 'react';
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
  [key: string]: string;
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

const renderedProfileFields = new Set<keyof UserProfile>([
  'bio',
  'experienceLevel',
  'externalLocationId',
  'hideExperience',
  'name',
  'readme',
  'socialLinks',
  'username',
]);

const isRenderedProfileField = (key: string): key is keyof UserProfile =>
  renderedProfileFields.has(key as keyof UserProfile);

const parseProfileFormHint = (message?: string): ProfileFormHint | null => {
  if (!message) {
    return null;
  }

  try {
    const parsed = JSON.parse(message);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    );
  } catch {
    return null;
  }
};

const useUserInfoForm = (): UseUserInfoForm => {
  const qc = useQueryClient();
  const { user, updateUser } = useContext(AuthContext);
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const router = useRouter();
  const userId = user?.id ?? '';

  // Fetch full profile via GraphQL to get socialLinks (boot endpoint doesn't include them)
  const userQueryKey = generateQueryKey(RequestKey.Profile, user, {
    id: userId,
  });
  const { data: fullProfile } = useQuery({
    queryKey: userQueryKey,
    queryFn: () => getProfile(userId),
    ...disabledRefetch,
    staleTime: StaleTime.OneHour,
    enabled: !!userId,
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
      socialLinks: user?.socialLinks || [],
    },
  });

  useEffect(() => {
    if (!fullProfile) {
      return;
    }

    if (!methods.getFieldState('socialLinks').isDirty) {
      methods.resetField('socialLinks', {
        defaultValue: fullProfile.socialLinks || [],
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
      const errorMessage = err?.response?.errors?.[0]?.message;
      const data = parseProfileFormHint(errorMessage);

      if (!data) {
        displayToast('Failed to update profile');
        return;
      }

      const toastMessages: string[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (isRenderedProfileField(key)) {
          methods.setError(key as keyof UserProfile, {
            type: 'manual',
            message: value,
          });
        } else {
          toastMessages.push(value);
        }
      });

      if (toastMessages.length) {
        displayToast(toastMessages[0]);
      } else if (!Object.keys(data).length) {
        displayToast('Failed to update profile');
      }
    },
  });

  const getProfileUpdatePayload = useCallback((): UpdateProfileParameters => {
    const formData = methods.getValues();
    const socialLinksTouched = methods.getFieldState('socialLinks').isDirty;
    const hasInitializedSocialLinks =
      !!fullProfile || Array.isArray(user?.socialLinks);

    if (!hasInitializedSocialLinks && !socialLinksTouched) {
      const { socialLinks, ...payload } = formData;
      return payload;
    }

    return formData;
  }, [fullProfile, methods, user?.socialLinks]);

  const dirtyForm = useDirtyForm(methods.formState.isDirty, {
    onSave: () => {
      updateUserProfile(getProfileUpdatePayload());
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
