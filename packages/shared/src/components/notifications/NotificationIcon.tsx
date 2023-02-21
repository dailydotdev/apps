import React, { ReactElement } from 'react';
import {
  notificationIcon,
  NotificationIconType,
  notificationIconTypeTheme,
} from './utils';

const noBackgroundIcons = [
  NotificationIconType.DailyDev,
  NotificationIconType.CommunityPicks,
];

interface NotificationItemIconProps {
  icon: NotificationIconType;
  iconTheme?: string;
}

function NotificationItemIcon({
  icon,
  iconTheme,
}: NotificationItemIconProps): ReactElement {
  const Icon = notificationIcon[icon] ?? notificationIcon.DailyDev;
  const testId = `notification-${icon}`;

  if (!notificationIcon[icon] || noBackgroundIcons.includes(icon)) {
    const testValue = !notificationIcon[icon]
      ? NotificationIconType.DailyDev
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

  const theme = iconTheme ?? notificationIconTypeTheme[icon];

  return (
    <span className="h-fit overflow-hidden rounded-8 bg-theme-float p-1 typo-callout">
      <Icon size="medium" secondary className={theme} data-testid={testId} />
    </span>
  );
}

export default NotificationItemIcon;
