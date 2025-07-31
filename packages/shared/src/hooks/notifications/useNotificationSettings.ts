import { NotificationPreferenceStatus } from '../../graphql/notifications';
import type { NotificationSettings } from '../../components/notifications/utils';
import { NotificationType } from '../../components/notifications/utils';
import useNotificationSettingsQuery from './useNotificationSettingsQuery';

const useNotificationSettings = () => {
  const {
    notificationSettings: ns,
    isLoading: isLoadingPreferences,
    mutate,
  } = useNotificationSettingsQuery();

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

  const toggleSquadPostSubmission = (value: boolean) => {
    const newStatus = value
      ? NotificationPreferenceStatus.Subscribed
      : NotificationPreferenceStatus.Muted;

    const updatedSettings = {
      ...ns,
      [NotificationType.SquadPostSubmitted]: {
        ...ns[NotificationType.SquadPostSubmitted],
        inApp: newStatus,
      },
      [NotificationType.SquadPostApproved]: {
        ...ns[NotificationType.SquadPostApproved],
        inApp: newStatus,
      },
      [NotificationType.SquadPostRejected]: {
        ...ns[NotificationType.SquadPostRejected],
        inApp: newStatus,
      },
    };

    mutate(updatedSettings);
  };

  const toggleComments = (value: boolean) => {
    const newStatus = value ? 'subscribed' : 'muted';

    const updatedSettings = {
      ...ns,
      [NotificationType.ArticleNewComment]: {
        ...ns[NotificationType.ArticleNewComment],
        inApp: newStatus,
      },
      [NotificationType.SquadNewComment]: {
        ...ns[NotificationType.SquadNewComment],
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
    toggleSquadPostSubmission,
    toggleComments,
  };
};

export default useNotificationSettings;
