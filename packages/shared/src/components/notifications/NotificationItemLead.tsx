import type { ReactElement } from 'react';
import React from 'react';
import type { NotificationAvatar } from '../../graphql/notifications';
import NotificationItemIcon from './NotificationIcon';
import NotificationItemAvatar from './NotificationItemAvatar';
import { NotificationCategoryBadge } from './NotificationCategoryBadge';
import type { NotificationIconType, NotificationType } from './utils';
import {
  getNotificationCategory,
  NotificationFilterCategory,
  notificationTypeTheme,
} from './utils';

interface NotificationItemLeadProps {
  type: NotificationType;
  icon: NotificationIconType;
  avatar?: NotificationAvatar;
}

// Single-actor lead: the avatar with the colored category badge notched into
// its corner (Instagram/Facebook/TikTok pattern), or the plain type icon when
// there's no actor (system/digest/streak). Shared so the feed row and the
// real-time in-app popup present a notification identically. NotificationItem's
// >3-actor overlapping stack is a list-only layout and stays in that component.
export function NotificationItemLead({
  type,
  icon,
  avatar,
}: NotificationItemLeadProps): ReactElement {
  const category = getNotificationCategory(type);
  const hasAvatar = !!avatar;
  // Badge only for notifications about you (upvotes/comments/mentions/follows/
  // squad activity). Source posts & system land in `Updates` and stay clean.
  const showBadge =
    hasAvatar && category !== NotificationFilterCategory.Updates;

  return (
    <div className="relative flex items-center">
      {avatar ? (
        <NotificationItemAvatar className="z-1" {...avatar} />
      ) : (
        <NotificationItemIcon
          icon={icon}
          iconTheme={notificationTypeTheme[type]}
        />
      )}
      {showBadge && (
        <NotificationCategoryBadge
          category={category}
          className="-bottom-1 -right-1"
        />
      )}
    </div>
  );
}
