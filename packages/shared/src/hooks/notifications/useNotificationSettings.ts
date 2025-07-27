import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  GET_NOTIFICATION_SETTINGS,
  updateNotificationSettings,
} from '../../graphql/users';
import { gqlClient } from '../../graphql/common';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { DEFAULT_NOTIFICATION_SETTINGS } from './common';
import { NotificationType } from '../../components/notifications/utils';

const useNotificationSettings = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const nsKey = generateQueryKey(RequestKey.NotificationSettings, {
    id: user?.id,
  });
  const { data: notificationSettings, isLoading: isLoadingPreferences } =
    useQuery({
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
    mutationFn: (notificationFlags: JSON) => {
      return updateNotificationSettings(notificationFlags);
    },
  });

  const toggleSetting = (key: string) => {
    const currentValue = notificationSettings[key]?.inApp;
    const newValue =
      currentValue === NotificationPreferenceStatus.Subscribed
        ? 'muted'
        : 'subscribed';

    const updatedSettings = {
      ...notificationSettings,
      [key]: {
        ...notificationSettings[key],
        inApp: newValue,
      },
    };

    console.log(updatedSettings);

    mutate(updatedSettings);
  };

  const toggleMentions = (value: boolean) => {
    const newStatus = value ? 'subscribed' : 'muted';

    const updatedSettings = {
      ...notificationSettings,
      [NotificationType.PostMention]: {
        ...notificationSettings[NotificationType.PostMention],
        inApp: newStatus,
      },
      [NotificationType.CommentMention]: {
        ...notificationSettings[NotificationType.CommentMention],
        inApp: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  const toggleAchievements = (value: boolean) => {
    const newStatus = value ? 'subscribed' : 'muted';

    const updatedSettings = {
      ...notificationSettings,
      [NotificationType.UserTopReaderBadge]: {
        ...notificationSettings[NotificationType.UserTopReaderBadge],
        inApp: newStatus,
      },
      [NotificationType.DevCardUnlocked]: {
        ...notificationSettings[NotificationType.DevCardUnlocked],
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
    const newStatus = value ? 'subscribed' : 'muted';

    const updatedSettings = {
      ...notificationSettings,
      [NotificationType.SourcePostAdded]: {
        ...notificationSettings[NotificationType.SourcePostAdded],
        inApp: newStatus,
      },
      [NotificationType.SquadPostAdded]: {
        ...notificationSettings[NotificationType.SquadPostAdded],
        inApp: newStatus,
      },
      [NotificationType.UserPostAdded]: {
        ...notificationSettings[NotificationType.UserPostAdded],
        inApp: newStatus,
      },
      [NotificationType.CollectionUpdated]: {
        ...notificationSettings[NotificationType.CollectionUpdated],
        inApp: newStatus,
      },
      [NotificationType.PostBookmarkReminder]: {
        ...notificationSettings[NotificationType.PostBookmarkReminder],
        inApp: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  const toggleStreak = (value: boolean) => {
    const newStatus = value ? 'subscribed' : 'muted';

    const updatedSettings = {
      ...notificationSettings,
      [NotificationType.StreakReminder]: {
        ...notificationSettings[NotificationType.StreakReminder],
        inApp: newStatus,
      },
      [NotificationType.StreakResetRestore]: {
        ...notificationSettings[NotificationType.StreakResetRestore],
        inApp: newStatus,
      },
    };
    mutate(updatedSettings);
  };

  const toggleSquadRole = (value: boolean) => {
    const newStatus = value ? 'subscribed' : 'muted';

    const updatedSettings = {
      ...notificationSettings,
      [NotificationType.PromotedToAdmin]: {
        ...notificationSettings[NotificationType.PromotedToAdmin],
        inApp: newStatus,
      },
      [NotificationType.PromotedToModerator]: {
        ...notificationSettings[NotificationType.PromotedToModerator],
        inApp: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  return {
    isLoadingPreferences,
    toggleSetting,
    notificationSettings,
    toggleMentions,
    toggleAchievements,
    toggleFollowing,
    toggleStreak,
    toggleSquadRole,
  };
};

export default useNotificationSettings;
