import { NotificationPreferenceStatus } from '../../graphql/notifications';
import type { NotificationSettings } from '../../components/notifications/utils';
import {
  MENTION_KEYS,
  ACHIEVEMENT_KEYS,
  FOLLOWING_KEYS,
  STREAK_KEYS,
  SQUAD_ROLE_KEYS,
  SOURCE_SUBMISSION_KEYS,
  SQUAD_POST_SUBMISSION_KEYS,
  COMMENT_KEYS,
} from '../../components/notifications/utils';
import useNotificationSettingsQuery from './useNotificationSettingsQuery';

const NOTIFICATION_GROUPS = {
  mentions: MENTION_KEYS,
  achievements: ACHIEVEMENT_KEYS,
  following: FOLLOWING_KEYS,
  streaks: STREAK_KEYS,
  squadRoles: SQUAD_ROLE_KEYS,
  sourceSubmission: SOURCE_SUBMISSION_KEYS,
  squadPostSubmission: SQUAD_POST_SUBMISSION_KEYS,
  comments: COMMENT_KEYS,
} as const;

type NotificationGroup = keyof typeof NOTIFICATION_GROUPS;
type NotificationChannel = 'inApp' | 'email';

const useNotificationSettings = () => {
  const {
    notificationSettings: ns,
    isLoading: isLoadingPreferences,
    mutate,
  } = useNotificationSettingsQuery();

  const toggleSetting = (key: string, channel: NotificationChannel) => {
    const currentValue = ns[key]?.[channel];
    const newValue =
      currentValue === NotificationPreferenceStatus.Subscribed
        ? NotificationPreferenceStatus.Muted
        : NotificationPreferenceStatus.Subscribed;

    const updatedSettings = {
      ...ns,
      [key]: {
        ...ns[key],
        [channel]: newValue,
      },
    };

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

    const updatedSettings = {
      ...ns,
      ...keys.reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            ...ns[key],
            [channel]: newStatus,
          },
        }),
        {},
      ),
    };

    mutate(updatedSettings);
  };

  const getGroupStatus = (
    groupName: NotificationGroup,
    channel: NotificationChannel,
  ) => {
    const keys = NOTIFICATION_GROUPS[groupName];
    return keys.some(
      (key) => ns?.[key]?.[channel] === NotificationPreferenceStatus.Subscribed,
    );
  };

  const unsubscribeAllEmail = () => {
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

  const emailsEnabled = ns
    ? Object.values(ns as NotificationSettings).some(
        (setting) => setting.email === NotificationPreferenceStatus.Subscribed,
      )
    : false;

  return {
    toggleSetting,
    toggleGroup,
    getGroupStatus,
    unsubscribeAllEmail,
    emailsEnabled,
    notificationSettings: ns as NotificationSettings,
    isLoadingPreferences,
  };
};

export default useNotificationSettings;
