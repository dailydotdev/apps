import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  GET_NOTIFICATION_SETTINGS,
  updateNotificationSettings,
} from '../../graphql/users';
import { gqlClient } from '../../graphql/common';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { NotificationSettings } from '../../components/notifications/utils';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationType,
} from '../../components/notifications/utils';

const useNotificationSettings = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const nsKey = generateQueryKey(RequestKey.NotificationSettings, {
    id: user?.id,
  });
  const { data: ns, isLoading: isLoadingPreferences } = useQuery({
    queryKey: nsKey,
    queryFn: async () => await gqlClient.request(GET_NOTIFICATION_SETTINGS),
    select: (data) => {
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...data.notificationSettings,
      };
    },
  });
  const { mutate } = useMutation({
    onMutate: (notificationFlags) => {
      const oldData = queryClient.getQueryData(nsKey);

      queryClient.setQueryData(nsKey, {
        notificationSettings: notificationFlags,
      });

      return { oldData };
    },
    onError: (err, _, { oldData }) => {
      queryClient.setQueryData(nsKey, oldData);
    },
    mutationFn: (notificationFlags: NotificationSettings) => {
      return updateNotificationSettings(notificationFlags);
    },
  });

  const toggleSetting = (key: string) => {
    const currentValue = ns[key]?.inApp;
    const newValue =
      currentValue === NotificationPreferenceStatus.Subscribed
        ? 'muted'
        : 'subscribed';

    const updatedSettings = {
      ...ns,
      [key]: {
        ...ns[key],
        inApp: newValue,
      },
    };

    mutate(updatedSettings);
  };

  const toggleMentions = (value: boolean) => {
    const newStatus = value ? 'subscribed' : 'muted';

    const updatedSettings = {
      ...ns,
      [NotificationType.PostMention]: {
        ...ns[NotificationType.PostMention],
        inApp: newStatus,
      },
      [NotificationType.CommentMention]: {
        ...ns[NotificationType.CommentMention],
        inApp: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  const toggleAchievements = (value: boolean) => {
    const newStatus = value ? 'subscribed' : 'muted';

    const updatedSettings = {
      ...ns,
      [NotificationType.UserTopReaderBadge]: {
        ...ns[NotificationType.UserTopReaderBadge],
        inApp: newStatus,
      },
      [NotificationType.DevCardUnlocked]: {
        ...ns[NotificationType.DevCardUnlocked],
        inApp: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  const toggleFollowing = (value: boolean) => {
    // const { newStatus, newValue } = getNewValues(
    //   'following',
    //   notificationSettings,
    // );
    const newStatus = value
      ? NotificationPreferenceStatus.Subscribed
      : NotificationPreferenceStatus.Muted;

    const updatedSettings = {
      ...ns,
      [NotificationType.SourcePostAdded]: {
        ...ns[NotificationType.SourcePostAdded],
        inApp: newStatus,
      },
      [NotificationType.SquadPostAdded]: {
        ...ns[NotificationType.SquadPostAdded],
        inApp: newStatus,
      },
      [NotificationType.UserPostAdded]: {
        ...ns[NotificationType.UserPostAdded],
        inApp: newStatus,
      },
      [NotificationType.CollectionUpdated]: {
        ...ns[NotificationType.CollectionUpdated],
        inApp: newStatus,
      },
      [NotificationType.PostBookmarkReminder]: {
        ...ns[NotificationType.PostBookmarkReminder],
        inApp: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  const toggleStreak = (value: boolean) => {
    const newStatus = value
      ? NotificationPreferenceStatus.Subscribed
      : NotificationPreferenceStatus.Muted;

    const updatedSettings = {
      ...ns,
      [NotificationType.StreakReminder]: {
        ...ns[NotificationType.StreakReminder],
        inApp: newStatus,
      },
      [NotificationType.StreakResetRestore]: {
        ...ns[NotificationType.StreakResetRestore],
        inApp: newStatus,
      },
    };
    mutate(updatedSettings);
  };

  const toggleSquadRole = (value: boolean) => {
    const newStatus = value
      ? NotificationPreferenceStatus.Subscribed
      : NotificationPreferenceStatus.Muted;

    const updatedSettings = {
      ...ns,
      [NotificationType.PromotedToAdmin]: {
        ...ns[NotificationType.PromotedToAdmin],
        inApp: newStatus,
      },
      [NotificationType.PromotedToModerator]: {
        ...ns[NotificationType.PromotedToModerator],
        inApp: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  const toggleSourceSubmission = (value: boolean) => {
    const newStatus = value
      ? NotificationPreferenceStatus.Subscribed
      : NotificationPreferenceStatus.Muted;

    const updatedSettings = {
      ...ns,
      [NotificationType.SourceApproved]: {
        ...ns[NotificationType.SourceApproved],
        inApp: newStatus,
      },
      [NotificationType.SourceRejected]: {
        ...ns[NotificationType.SourceRejected],
        inApp: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  return {
    isLoadingPreferences,
    toggleSetting,
    notificationSettings: ns as NotificationSettings,
    toggleMentions,
    toggleAchievements,
    toggleFollowing,
    toggleStreak,
    toggleSquadRole,
    toggleSourceSubmission,
  };
};

export default useNotificationSettings;
