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
  const testId = `notification-${icon}`;

  if (!notificationIcon[icon] || noBackgroundIcons.includes(icon)) {
    const testValue = !notificationIcon[icon]
      ? NotificationIcon.DailyDev
      : icon;
    return (
      <Icon
        secondary
        size="xlarge"
        data-testid={testId}
        data-testvalue={testValue}
      />
    );
  }

  const iconTheme = notificationDefaultTheme[icon];

  return (
    <span className="overflow-hidden p-1 bg-theme-float rounded-8 typo-callout h-fit">
      <Icon
        size="medium"
        secondary
        className={iconTheme}
        data-testid={testId}
      />
    </span>
  );
}

export default NotificationItemIcon;
