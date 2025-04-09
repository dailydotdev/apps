import type { ReactElement } from 'react';
import React from 'react';
import {
  notificationIcon,
  notificationIconAsPrimary,
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
  const secondary = !notificationIconAsPrimary.includes(icon);

  if (!notificationIcon[icon] || noBackgroundIcons.includes(icon)) {
    const testValue = !notificationIcon[icon]
      ? NotificationIconType.DailyDev
      : icon;

    return (
      <Icon
        secondary={secondary}
        size={IconSize.Large}
        data-testid={testId}
        data-testvalue={testValue}
      />
    );
  }

  const theme = iconTheme ?? notificationIconTypeTheme[icon];

  return (
    <span className="h-fit overflow-hidden rounded-8 bg-surface-float p-1 typo-callout">
      <Icon
        size={IconSize.Small}
        secondary={secondary}
        className={theme}
        data-testid={testId}
      />
    </span>
  );
}

export default NotificationItemIcon;
