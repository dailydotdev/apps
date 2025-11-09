import type { ReactElement } from 'react';
import React from 'react';
import {
  notificationIcon,
  notificationIconAsPrimary,
  notificationIconStyle,
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
  const style = notificationIconStyle[icon];

  return (
    <span
      className="rounded-8 bg-surface-float typo-callout h-fit overflow-hidden p-1"
      style={style}
    >
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
