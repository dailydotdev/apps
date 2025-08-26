import { NotificationPreferenceStatus } from '../../graphql/notifications';
import type {
  NotificationSettings,
  NotificationType,
} from '../../components/notifications/utils';
import {
  MENTION_KEYS,
  ACHIEVEMENT_KEYS,
  FOLLOWING_KEYS,
  STREAK_KEYS,
  SQUAD_ROLE_KEYS,
  SOURCE_SUBMISSION_KEYS,
  SQUAD_POST_REVIEW_KEYS,
  SQUAD_MODERATION_KEYS,
  COMMENT_KEYS,
  SQUAD_KEYS,
  CREATOR_UPDATES_EMAIL_KEYS,
  FOLLOWING_EMAIL_KEYS,
  isMutingDigestCompletely,
} from '../../components/notifications/utils';
import useNotificationSettingsQuery from './useNotificationSettingsQuery';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, NotificationCategory } from '../../lib/log';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { usePersonalizedDigest } from '../usePersonalizedDigest';

const NOTIFICATION_GROUPS = {
  mentions: MENTION_KEYS,
  achievements: ACHIEVEMENT_KEYS,
  following: FOLLOWING_KEYS,
  followingEmail: FOLLOWING_EMAIL_KEYS,
  streaks: STREAK_KEYS,
  squadRoles: SQUAD_ROLE_KEYS,
  sourceSubmission: SOURCE_SUBMISSION_KEYS,
  squadPostReview: SQUAD_POST_REVIEW_KEYS,
  squadModeration: SQUAD_MODERATION_KEYS,
  comments: COMMENT_KEYS,
  squadNotifications: SQUAD_KEYS,
  creatorUpdatesEmail: CREATOR_UPDATES_EMAIL_KEYS,
} as const;

export type NotificationGroup = keyof typeof NOTIFICATION_GROUPS;
export type NotificationChannel = 'inApp' | 'email';

const defaultEmailLogProps = {
  extra: JSON.stringify({
    channel: 'email',
    category: [NotificationCategory.Product, NotificationCategory.Marketing],
  }),
};

const useNotificationSettings = () => {
  const { unsubscribePersonalizedDigest, getPersonalizedDigest } =
    usePersonalizedDigest();
  const { logEvent } = useLogContext();
  const {
    notificationSettings,
    isLoading: isLoadingPreferences,
    mutate,
  } = useNotificationSettingsQuery();

  const toggleSetting = (key: string, channel: NotificationChannel) => {
    const currentValue = notificationSettings[key]?.[channel];
    const newValue =
      currentValue === NotificationPreferenceStatus.Subscribed
        ? NotificationPreferenceStatus.Muted
        : NotificationPreferenceStatus.Subscribed;

    const updatedSettings: NotificationSettings = {
      ...notificationSettings,
      [key]: {
        ...notificationSettings[key],
        [channel]: newValue,
      },
    };

    if (newValue === NotificationPreferenceStatus.Subscribed) {
      logEvent({
        event_name: LogEvent.EnableNotification,
        ...(channel === 'email' ? defaultEmailLogProps : {}),
      });
    } else {
      logEvent({
        event_name: LogEvent.DisableNotification,
        ...(channel === 'email' ? defaultEmailLogProps : {}),
      });
    }

    mutate(updatedSettings);
  };

  const toggleGroup = (
    groupName: NotificationGroup,
    value: boolean,
    channel: NotificationChannel,
  ) => {
    const keys = NOTIFICATION_GROUPS[groupName];
    const newStatus = value
      ? NotificationPreferenceStatus.Subscribed
      : NotificationPreferenceStatus.Muted;

    const updatedSettings: NotificationSettings = {
      ...notificationSettings,
      ...keys.reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            ...notificationSettings[key],
            [channel]: newStatus,
          },
        }),
        {},
      ),
    };

    if (newStatus === NotificationPreferenceStatus.Subscribed) {
      logEvent({
        event_name: LogEvent.EnableNotification,
        ...(channel === 'email' ? defaultEmailLogProps : {}),
      });
    } else {
      logEvent({
        event_name: LogEvent.DisableNotification,
        ...(channel === 'email' ? defaultEmailLogProps : {}),
      });
    }

    mutate(updatedSettings);
  };

  const getGroupStatus = (
    groupName: NotificationGroup,
    channel: NotificationChannel,
  ) => {
    const keys = NOTIFICATION_GROUPS[groupName];
    return keys.some(
      (key) =>
        notificationSettings?.[key]?.[channel] ===
        NotificationPreferenceStatus.Subscribed,
    );
  };

  const setNotificationStatus = (
    type: NotificationType,
    channel: NotificationChannel,
    status: NotificationPreferenceStatus,
  ) => {
    const updatedSettings: NotificationSettings = {
      ...notificationSettings,
      [type]: {
        ...notificationSettings[type],
        [channel]: status,
      },
    };

    mutate(updatedSettings);
  };

  const unsubscribeAllEmail = () => {
    const updatedSettings: NotificationSettings = Object.keys(
      notificationSettings || {},
    ).reduce((acc, key) => {
      acc[key] = {
        ...notificationSettings[key],
        email: NotificationPreferenceStatus.Muted,
      };
      return acc;
    }, {});
    mutate(updatedSettings);

    const personalDigest = getPersonalizedDigest(
      UserPersonalizedDigestType.Digest,
    );

    // We unsubscribe digest if it exists because its only available by email.
    if (personalDigest) {
      unsubscribePersonalizedDigest({
        type: UserPersonalizedDigestType.Digest,
      });
    }

    const briefDigest = getPersonalizedDigest(UserPersonalizedDigestType.Brief);

    if (
      briefDigest &&
      isMutingDigestCompletely(notificationSettings, 'email')
    ) {
      unsubscribePersonalizedDigest({
        type: UserPersonalizedDigestType.Brief,
      });
    }
  };

  const emailsDisabled = notificationSettings
    ? !Object.values(notificationSettings).some(
        (setting) => setting.email === NotificationPreferenceStatus.Subscribed,
      )
    : true;

  return {
    toggleSetting,
    toggleGroup,
    getGroupStatus,
    setNotificationStatus,
    unsubscribeAllEmail,
    emailsDisabled,
    notificationSettings,
    isLoadingPreferences,
  };
};

export default useNotificationSettings;
