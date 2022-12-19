import React, { ReactElement } from 'react';
import {
  notificationDefaultTheme,
  notificationIcon,
  NotificationIcon,
} from './utils';

const noBackgroundIcons = [
  NotificationIcon.DailyDev,
  NotificationIcon.CommunityPicks,
];

interface NotificationItemIconProps {
  icon: NotificationIcon;
}

function NotificationItemIcon({
  icon,
}: NotificationItemIconProps): ReactElement {
  const Icon = notificationIcon[icon] ?? notificationIcon.DailyDev;

  if (!notificationIcon[icon] || noBackgroundIcons.includes(icon)) {
    return <Icon secondary size="xlarge" />;
  }

  const iconTheme = notificationDefaultTheme[icon];

  return (
    <span className="overflow-hidden p-1 bg-theme-float rounded-8 typo-callout h-fit">
      <Icon secondary className={iconTheme} />
    </span>
  );
}

export default NotificationItemIcon;
