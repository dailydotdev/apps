import { NotificationPreferenceStatus } from '../../graphql/notifications';
import type { NotificationSettings } from '../../components/notifications/utils';
import { NotificationType } from '../../components/notifications/utils';
import useNotificationSettingsQuery from './useNotificationSettingsQuery';

const useEmailNotificationSettings = () => {
  const {
    notificationSettings: ns,
    isLoading: isLoadingPreferences,
    mutate,
  } = useNotificationSettingsQuery();
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

  const toggleEmailComments = (value: boolean) => {
    const newStatus = value
      ? NotificationPreferenceStatus.Subscribed
      : NotificationPreferenceStatus.Muted;

    const updatedSettings = {
      ...ns,
      [NotificationType.ArticleNewComment]: {
        ...ns[NotificationType.ArticleNewComment],
        email: newStatus,
      },
      [NotificationType.SquadNewComment]: {
        ...ns[NotificationType.SquadNewComment],
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
    toggleEmailComments,
    unsubscribeAll,
    emailsEnabled: Object.values(ns as NotificationSettings).some(
      (setting) => setting.email === 'subscribed',
    ),
  };
};

export default useEmailNotificationSettings;
