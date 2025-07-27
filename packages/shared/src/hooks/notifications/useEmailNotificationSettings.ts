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

const useEmailNotificationSettings = () => {
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

  const toggleEmailSetting = (key: string) => {
    const currentValue = ns[key]?.email;
    const newValue =
      currentValue === NotificationPreferenceStatus.Subscribed
        ? NotificationPreferenceStatus.Muted
        : NotificationPreferenceStatus.Subscribed;

    const updatedSettings = {
      ...ns,
      [key]: {
        ...ns[key],
        email: newValue,
      },
    };

    mutate(updatedSettings);
  };

  const toggleEmailMentions = (value: boolean) => {
    const newStatus = value
      ? NotificationPreferenceStatus.Subscribed
      : NotificationPreferenceStatus.Muted;

    const updatedSettings = {
      ...ns,
      [NotificationType.PostMention]: {
        ...ns[NotificationType.PostMention],
        email: newStatus,
      },
      [NotificationType.CommentMention]: {
        ...ns[NotificationType.CommentMention],
        email: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  const toggleEmailAchievements = (value: boolean) => {
    const newStatus = value
      ? NotificationPreferenceStatus.Subscribed
      : NotificationPreferenceStatus.Muted;

    const updatedSettings = {
      ...ns,
      [NotificationType.UserTopReaderBadge]: {
        ...ns[NotificationType.UserTopReaderBadge],
        email: newStatus,
      },
      [NotificationType.DevCardUnlocked]: {
        ...ns[NotificationType.DevCardUnlocked],
        email: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  const toggleEmailFollowing = (value: boolean) => {
    const newStatus = value
      ? NotificationPreferenceStatus.Subscribed
      : NotificationPreferenceStatus.Muted;

    const updatedSettings = {
      ...ns,
      [NotificationType.SourcePostAdded]: {
        ...ns[NotificationType.SourcePostAdded],
        email: newStatus,
      },
      [NotificationType.SquadPostAdded]: {
        ...ns[NotificationType.SquadPostAdded],
        email: newStatus,
      },
      [NotificationType.UserPostAdded]: {
        ...ns[NotificationType.UserPostAdded],
        email: newStatus,
      },
      [NotificationType.CollectionUpdated]: {
        ...ns[NotificationType.CollectionUpdated],
        email: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  const toggleEmailStreak = (value: boolean) => {
    const newStatus = value
      ? NotificationPreferenceStatus.Subscribed
      : NotificationPreferenceStatus.Muted;

    const updatedSettings = {
      ...ns,
      [NotificationType.StreakReminder]: {
        ...ns[NotificationType.StreakReminder],
        email: newStatus,
      },
      [NotificationType.StreakResetRestore]: {
        ...ns[NotificationType.StreakResetRestore],
        email: newStatus,
      },
    };
    mutate(updatedSettings);
  };

  const toggleEmailCreatorUpdates = (value: boolean) => {
    const newStatus = value
      ? NotificationPreferenceStatus.Subscribed
      : NotificationPreferenceStatus.Muted;

    const updatedSettings = {
      ...ns,
      [NotificationType.SourcePostApproved]: {
        ...ns[NotificationType.SourcePostApproved],
        email: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  const unsubscribeAll = () => {
    const updatedSettings: NotificationSettings = Object.keys(ns).reduce(
      (acc, key) => {
        acc[key] = {
          ...ns[key],
          email: NotificationPreferenceStatus.Muted,
        };
        return acc;
      },
      {},
    );
    mutate(updatedSettings);
  };

  return {
    isLoadingPreferences,
    toggleEmailSetting,
    notificationSettings: ns,
    toggleEmailMentions,
    toggleEmailAchievements,
    toggleEmailFollowing,
    toggleEmailStreak,
    toggleEmailCreatorUpdates,
    unsubscribeAll,
    emailsEnabled: Object.values(ns as NotificationSettings).some(
      (setting) => setting.email === 'subscribed',
    ),
  };
};

export default useEmailNotificationSettings;
