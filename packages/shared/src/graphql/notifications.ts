import { gql } from 'graphql-request';
import {
  NotificationIconType,
  NotificationType,
} from '../components/notifications/utils';
import { Connection, gqlClient } from './common';
import { EmptyResponse } from './emptyResponse';
import { WithClassNameProps } from '../components/utilities';

export enum NotificationAvatarType {
  User = 'user',
  Source = 'source',
}

export interface NotificationAvatar extends WithClassNameProps {
  type: NotificationAvatarType;
  image: string;
  name: string;
  targetUrl: string;
  referenceId: string;
}

export enum NotificationAttachmentType {
  Post = 'post',
  Video = 'video',
}

export interface NotificationAttachment {
  image: string;
  title: string;
  type: NotificationAttachmentType;
}

export interface Notification {
  id: string;
  referenceId: string;
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
  numTotalAvatars?: number;
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
          referenceId
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
          numTotalAvatars
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
  | 'createdAt'
  | 'icon'
  | 'id'
  | 'targetUrl'
  | 'title'
  | 'type'
  | 'avatars'
  | 'numTotalAvatars'
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
      numTotalAvatars
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

export const HIDE_SOURCE_ON_FEED_MUTATION = gql`
  mutation HideSourceFeedPosts($sourceId: ID!) {
    hideSourceFeedPosts(sourceId: $sourceId) {
      _
    }
  }
`;

export const SHOW_SOURCE_ON_FEED_MUTATION = gql`
  mutation ShowSourceFeedPosts($sourceId: ID!) {
    showSourceFeedPosts(sourceId: $sourceId) {
      _
    }
  }
`;

export const SUBSCRIBE_NOTIFICATION_MUTATION = gql`
  mutation SubscribeNotificationPreference($referenceId: ID!, $type: String!) {
    subscribeNotificationPreference(referenceId: $referenceId, type: $type) {
      _
    }
  }
`;

export enum NotificationPreferenceStatus {
  Muted = 'muted',
  Subscribed = 'subscribed',
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

export interface NotificationPreferenceParams
  extends Pick<NotificationPreference, 'referenceId'> {
  type: NotificationType;
}

type FetchParams = Pick<
  NotificationPreference,
  'referenceId' | 'notificationType'
>;

export const getNotificationPreferences = async (
  params: FetchParams[],
): Promise<NotificationPreference[]> => {
  const res = await gqlClient.request(NOTIFICATION_PREFERENCES_QUERY, {
    data: params,
  });

  return res.notificationPreferences;
};

export const notificationPreferenceMap: Partial<
  Record<NotificationType, NotificationPreferenceType>
> = {
  [NotificationType.ArticleNewComment]: NotificationPreferenceType.Post,
  [NotificationType.SquadNewComment]: NotificationPreferenceType.Post,
  [NotificationType.CommentReply]: NotificationPreferenceType.Comment,
  [NotificationType.SquadReply]: NotificationPreferenceType.Comment,
  [NotificationType.SquadPostAdded]: NotificationPreferenceType.Source,
  [NotificationType.SquadMemberJoined]: NotificationPreferenceType.Source,
  [NotificationType.SourcePostAdded]: NotificationPreferenceType.Source,
};

export const muteNotification = async (
  params: NotificationPreferenceParams,
): Promise<EmptyResponse> => {
  const res = await gqlClient.request(MUTE_NOTIFICATION_MUTATION, params);

  return res.muteNotificationPreference;
};

export const clearNotificationPreference = async (
  params: NotificationPreferenceParams,
): Promise<EmptyResponse> => {
  const res = await gqlClient.request(
    CLEAR_NOTIFICATION_PREFERENCE_MUTATION,
    params,
  );

  return res.clearNotificationPreference;
};

export const hideSourceFeedPosts = async (
  sourceId: string,
): Promise<EmptyResponse> => {
  const res = await gqlClient.request(HIDE_SOURCE_ON_FEED_MUTATION, {
    sourceId,
  });

  return res.showSourceFeedPosts;
};

export const showSourceFeedPosts = async (
  sourceId: string,
): Promise<EmptyResponse> => {
  const res = await gqlClient.request(SHOW_SOURCE_ON_FEED_MUTATION, {
    sourceId,
  });

  return res.showSourceFeedPosts;
};

export const subscribeNotification = async (
  params: NotificationPreferenceParams,
): Promise<EmptyResponse> => {
  const res = await gqlClient.request(SUBSCRIBE_NOTIFICATION_MUTATION, params);

  return res.subscribeNotificationPreference;
};
