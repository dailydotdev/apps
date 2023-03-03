import React, { ReactElement } from 'react';
import {
  notificationIcon,
  NotificationIconType,
  notificationIconTypeTheme,
} from './utils';
import { IconSize } from '../Icon';

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
        size={IconSize.Large}
        data-testid={testId}
        data-testvalue={testValue}
      />
    );
  }

  const theme = iconTheme ?? notificationIconTypeTheme[icon];

  return (
    <span className="overflow-hidden p-1 bg-theme-float rounded-8 typo-callout h-fit">
      <Icon
        size={IconSize.Small}
        secondary
        className={theme}
        data-testid={testId}
      />
    </span>
  );
}

export default NotificationItemIcon;
