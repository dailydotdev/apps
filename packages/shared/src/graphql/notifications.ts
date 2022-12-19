import { gql } from 'graphql-request';
import { ComponentType } from 'react';
import { IconProps } from '../components/Icon';
import BellIcon from '../components/icons/Bell';
import CommunityPicksIcon from '../components/icons/CommunityPicksIcon';
import DailyIcon from '../components/icons/DailyIcon';
import DiscussIcon from '../components/icons/Discuss';
import UpvoteIcon from '../components/icons/Upvote';
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

export enum NotificationIcon {
  DailyDev = 'DailyDev',
  CommunityPicks = 'CommunityPicks',
  Comment = 'Comment',
  Upvote = 'Upvote',
  Bell = 'Bell',
}

export const notificationIcon: Record<
  NotificationIcon,
  ComponentType<IconProps>
> = {
  [NotificationIcon.DailyDev]: DailyIcon,
  [NotificationIcon.CommunityPicks]: CommunityPicksIcon,
  [NotificationIcon.Comment]: DiscussIcon,
  [NotificationIcon.Upvote]: UpvoteIcon,
  [NotificationIcon.Bell]: BellIcon,
};

export const notificationDefaultTheme: Record<NotificationIcon, string> = {
  [NotificationIcon.DailyDev]: '',
  [NotificationIcon.CommunityPicks]: '',
  [NotificationIcon.Comment]: 'text-theme-color-blueCheese',
  [NotificationIcon.Upvote]: 'text-theme-color-blueCheese',
  [NotificationIcon.Bell]: '',
};

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
