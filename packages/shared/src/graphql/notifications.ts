import request, { gql } from 'graphql-request';
import {
  NotificationIconType,
  NotificationType,
} from '../components/notifications/utils';
import { Connection } from './common';
import { graphqlUrl } from '../lib/config';
import { EmptyResponse } from './emptyResponse';

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

export interface Notification {
  id: string;
  userId: string;
  createdAt: Date;
  readAt?: Date;
  icon: NotificationIconType;
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

export const NOTIFICATION_PREFERENCES_QUERY = gql`
  query NotificationPreferences($data: [NotificationPreferenceInput]!) {
    notificationPreferences(data: $data) {
      referenceId
      userId
      notificationType
      status
      type
    }
  }
`;

export const MUTE_NOTIFICATION_MUTATION = gql`
  mutation MuteNotificationPreference($referenceId: ID!, $type: String!) {
    muteNotificationPreference(referenceId: $referenceId, type: $type) {
      _
    }
  }
`;

export const CLEAR_NOTIFICATION_PREFERENCE_MUTATION = gql`
  mutation ClearNotificationPreference($referenceId: ID!, $type: String!) {
    clearNotificationPreference(referenceId: $referenceId, type: $type) {
      _
    }
  }
`;

export enum NotificationPreferenceStatus {
  Muted = 'muted',
}

enum NotificationPreferenceType {
  Post = 'post',
  Comment = 'comment',
  Source = 'source',
}

export interface NotificationPreference {
  referenceId: string;
  userId: string;
  notificationType: NotificationType;
  status: NotificationPreferenceStatus;
  type: NotificationPreferenceType;
}

interface NotificationPreferenceParams
  extends Pick<NotificationPreference, 'referenceId'> {
  type: NotificationType;
}

export const getNotificationPreferences = async (
  params: NotificationPreferenceParams[],
): Promise<NotificationPreference[]> => {
  const res = await request(graphqlUrl, NOTIFICATION_PREFERENCES_QUERY, {
    data: params,
  });

  return res.notificationPreferences;
};

export const notificationPreferenceMap: Partial<
  Record<NotificationType, NotificationPreferenceType>
> = {
  [NotificationType.ArticleNewComment]: NotificationPreferenceType.Post,
  [NotificationType.CommentReply]: NotificationPreferenceType.Comment,
  [NotificationType.SquadReply]: NotificationPreferenceType.Comment,
  [NotificationType.SquadPostAdded]: NotificationPreferenceType.Source,
  [NotificationType.SquadMemberJoined]: NotificationPreferenceType.Source,
};

export const muteNotification = async (
  params: NotificationPreferenceParams,
): Promise<EmptyResponse> => {
  const res = await request(graphqlUrl, MUTE_NOTIFICATION_MUTATION, params);

  return res.muteNotificationPreference;
};

export const clearNotificationPreference = async (
  params: NotificationPreferenceParams,
): Promise<EmptyResponse> => {
  const res = await request(
    graphqlUrl,
    CLEAR_NOTIFICATION_PREFERENCE_MUTATION,
    params,
  );

  return res.clearNotificationPreference;
};
