import type { ReactElement } from 'react';
import React from 'react';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { Typography, TypographyType } from '../typography/Typography';
import { settingsUrl, webappUrl } from '../../lib/constants';
import { BellIcon, SettingsIcon } from '../icons';
import { IconSize } from '../Icon';
import { RailHoverRow } from '../sidebar/RailHoverRow';

// Compact menu in the rail hover card. Lists the destinations the
// notifications rail icon can reach so the hover preview matches the
// rail's click model (same affordance as other category hover cards).
export const NotificationsRailPanel = (): ReactElement => {
  const { unreadCount } = useNotificationContext();
  const hasUnread = !!unreadCount;

  return (
    <div className="flex flex-col px-2 pb-2">
      <RailHoverRow
        href={`${webappUrl}notifications`}
        icon={<BellIcon size={IconSize.XSmall} aria-hidden />}
        label="All activity"
        trailing={
          hasUnread ? (
            <Typography
              type={TypographyType.Caption1}
              bold
              className="rounded-6 bg-accent-ketchup-default px-1.5 text-white"
            >
              {unreadCount}
            </Typography>
          ) : undefined
        }
      />
      <RailHoverRow
        href={`${settingsUrl}/notifications`}
        icon={<SettingsIcon size={IconSize.XSmall} aria-hidden />}
        label="Settings"
      />
    </div>
  );
};
