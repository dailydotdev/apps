import { useContext, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import AuthContext from '../contexts/AuthContext';
import { mutateUserInfo } from '../graphql/users';
import type {
  LoggedUser,
  PublicProfile,
  UserProfile,
  UserSocialLink,
} from '../lib/user';
import { useToastNotification } from './useToastNotification';
import type { ResponseError } from '../graphql/common';
import { errorMessage } from '../graphql/common';
import { useDirtyForm } from './useDirtyForm';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import { useProfile } from './profile/useProfile';

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

/**
 * Build socialLinks array from legacy individual fields
 * @deprecated Used for backwards compatibility during migration
 */
const buildSocialLinksFromLegacy = (
  user: LoggedUser | undefined,
): UserSocialLink[] => {
  if (!user) {
    return [];
  }
  return [
    user.github && {
      platform: 'github',
      url: `https://github.com/${user.github}`,
    },
    user.linkedin && {
      platform: 'linkedin',
      url: `https://linkedin.com/in/${user.linkedin}`,
    },
    user.portfolio && { platform: 'portfolio', url: user.portfolio },
    user.twitter && {
      platform: 'twitter',
      url: `https://x.com/${user.twitter}`,
    },
    user.youtube && {
      platform: 'youtube',
      url: `https://youtube.com/@${user.youtube}`,
    },
    user.stackoverflow && {
      platform: 'stackoverflow',
      url: `https://stackoverflow.com/users/${user.stackoverflow}`,
    },
    user.reddit && {
      platform: 'reddit',
      url: `https://reddit.com/user/${user.reddit}`,
    },
    user.roadmap && {
      platform: 'roadmap',
      url: `https://roadmap.sh/u/${user.roadmap}`,
    },
    user.codepen && {
      platform: 'codepen',
      url: `https://codepen.io/${user.codepen}`,
    },
    user.mastodon && { platform: 'mastodon', url: user.mastodon },
    user.bluesky && {
      platform: 'bluesky',
      url: `https://bsky.app/profile/${user.bluesky}`,
    },
    user.threads && {
      platform: 'threads',
      url: `https://threads.net/@${user.threads}`,
    },
  ].filter(Boolean) as UserSocialLink[];
};

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
  const qc = useQueryClient();
  const { user, updateUser } = useContext(AuthContext);
  const { userQueryKey } = useProfile(user as PublicProfile);
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const router = useRouter();

  // Build initial socialLinks from user data or legacy fields
  const initialSocialLinks = useMemo(() => {
    if (user?.socialLinks && user.socialLinks.length > 0) {
      return user.socialLinks;
    }
    return buildSocialLinksFromLegacy(user);
  }, [user]);

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
      socialLinks: initialSocialLinks,
    },
  });

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
