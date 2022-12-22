import { gql } from 'graphql-request';
import { NotificationIcon } from '../components/notifications/utils';
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
  icon: NotificationIcon;
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
          createdAt
          readAt
          icon
          title
          type
          description
          avatars {
            referenceId
            type
            image
            name
            targetUrl
          }
          attachments {
            type
            image
            title
          }
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

export type NewNotification = Pick<
  Notification,
  'createdAt' | 'icon' | 'id' | 'targetUrl' | 'title' | 'type' | 'avatars'
>;

export const NEW_NOTIFICATIONS_SUBSCRIPTION = gql`
  subscription NewNotification {
    newNotification {
      createdAt
      icon
      id
      targetUrl
      title
      type
      avatars {
        type
        image
        name
        targetUrl
      }
    }
  }
`;
