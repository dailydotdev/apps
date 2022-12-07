import { gql } from 'graphql-request';
import { Connection } from './common';

export enum NotificationAvatarType {
  User = 'user',
  Source = 'source',
}

export interface NotificationAvatar {
  type: NotificationAvatarType;
  image: string;
  name: string;
  targetUrl: string;
  referenceId: string;
}

export interface NotificationAttachment {
  image: string;
  title: string;
}

export enum NotificationType {
  System = 'system',
}

export interface Notification {
  id: string;
  userId: string;
  createdAt: Date;
  readAt?: Date;
  icon: string;
  title: string;
  type: NotificationType;
  description?: string;
  avatars?: NotificationAvatar[];
  attachments?: NotificationAttachment[];
  targetUrl: string;
}

export interface NotificationsData {
  notifications: Connection<Notification>;
}

export const NOTIFICATIONS_QUERY = gql`
  query Notifications($after: String, $first: Int) {
    notifications(after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          userId
          createdAt
          readAt
          icon
          title
          type
          description
          grantedReputation
          avatars
          attachments
          targetUrl
        }
      }
    }
  }
`;

export const READ_NOTIFICATIONS_MUTATION = gql`
  mutation ReadNotifications {
    readNotifications {
      _
    }
  }
`;

export interface DeviceNotificationPreference {
  deviceId: string;
  description: string;
  pushNotification?: boolean;
}

export interface DevicePreferenceData {
  preference: Pick<DeviceNotificationPreference, 'pushNotification'>;
}

export interface GeneralNotificationPreference {
  marketingEmail?: boolean;
  notificationEmail?: boolean;
}

export interface GeneralPreferenceData {
  preference: GeneralNotificationPreference;
}

export const GENERAL_PREFERENCE_QUERY = gql`
  query GeneralNotificationPreference {
    preference: generalNotificationPreference {
      marketingEmail
      notificationEmail
    }
  }
`;

export const UPDATE_GENERAL_PREFERENCE_MUTATION = gql`
  mutation UpdateGeneralNotificationPreference(
    $data: GeneralNotificationPreferenceInput!
  ) {
    updateGeneralNotificationPreference(data: $data) {
      _
    }
  }
`;

export const DEVICE_PREFERENCE_QUERY = gql`
  query DeviceNotificationPreference($deviceId: String!) {
    preference: deviceNotificationPreference(deviceId: $deviceId) {
      pushNotification
    }
  }
`;

export const UPDATE_DEVICE_PREFERENCE_MUTATION = gql`
  mutation UpdateDeviceNotificationPreference(
    $deviceId: String!
    $data: DeviceNotificationPreferenceInput!
  ) {
    updateDeviceNotificationPreference(deviceId: $deviceId, data: $data) {
      _
    }
  }
`;
