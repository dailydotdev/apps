import { ComponentType } from 'react';
import classed from '../../lib/classed';
import { IconProps } from '../Icon';
import BellIcon from '../icons/Bell';
import CommunityPicksIcon from '../icons/CommunityPicksIcon';
import DailyIcon from '../icons/DailyIcon';
import DiscussIcon from '../icons/Discuss';
import EyeIcon from '../icons/Eye';
import UpvoteIcon from '../icons/Upvote';

export const NotifContainer = classed(
  'div',
  'fixed left-1/2 flex flex-col justify-center bg-theme-label-primary p-2 rounded-14 border-theme-divider-primary shadow-2',
);
export const NotifContent = classed(
  'div',
  'relative flex flex-row items-center ml-2',
);
export const NotifMessage = classed(
  'div',
  'flex-1 mr-2 typo-subhead text-theme-label-invert',
);
export const NotifProgress = classed(
  'span',
  'absolute -bottom-2 h-1 ease-in-out bg-theme-status-cabbage rounded-full',
);

export enum NotificationType {
  System = 'system',
  SquaPostAdded = 'squad_post_added',
  SquadMemberJoined = 'squad_member_joined',
}

export enum NotificationIconType {
  DailyDev = 'DailyDev',
  CommunityPicks = 'CommunityPicks',
  Comment = 'Comment',
  Upvote = 'Upvote',
  Bell = 'Bell',
  View = 'View',
}

export const notificationIcon: Record<
  NotificationIconType,
  ComponentType<IconProps>
> = {
  [NotificationIconType.DailyDev]: DailyIcon,
  [NotificationIconType.CommunityPicks]: CommunityPicksIcon,
  [NotificationIconType.Comment]: DiscussIcon,
  [NotificationIconType.Upvote]: UpvoteIcon,
  [NotificationIconType.Bell]: BellIcon,
  [NotificationIconType.View]: EyeIcon,
};

export const notificationIconTypeTheme: Record<NotificationIconType, string> = {
  [NotificationIconType.DailyDev]: '',
  [NotificationIconType.CommunityPicks]: '',
  [NotificationIconType.Comment]: 'text-theme-color-blueCheese',
  [NotificationIconType.Upvote]: 'text-theme-color-avocado',
  [NotificationIconType.Bell]: '',
  [NotificationIconType.View]: 'text-theme-color-blueCheese',
};

export const notificationTypeTheme: Record<NotificationType, string> = {
  [NotificationType.System]: '',
  [NotificationType.SquaPostAdded]: 'text-theme-color-cabbage',
  [NotificationType.SquadMemberJoined]: 'text-theme-color-cabbage',
};

const notificationsUrl = `/notifications`;

export const checkAtNotificationsPage = (): boolean =>
  notificationsUrl === globalThis.window?.location.pathname;

const MAX_UNREAD_DISPLAY = 20;

export const getUnreadText = (unread: number): string =>
  unread > MAX_UNREAD_DISPLAY ? `${MAX_UNREAD_DISPLAY}+` : unread.toString();
