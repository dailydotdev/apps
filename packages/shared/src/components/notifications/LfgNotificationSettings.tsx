import type { ReactElement } from 'react';
import React from 'react';
import { Typography, TypographyType } from '../typography/Typography';
import { HorizontalSeparator } from '../utilities';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';
import type { NotificationChannel } from '../../hooks/notifications/useNotificationSettings';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import { useLfgEnabled } from '../../features/lfg/hooks/useLfgEnabled';
import {
  LFG_NOTIFICATIONS,
  NotificationContainer,
  NotificationSection,
} from './utils';
import NotificationSwitch from './NotificationSwitch';

// Only people who have Looking for group get its notifications, so only they
// see the switches.
export const LfgNotificationSettings = ({
  channel,
}: {
  channel: NotificationChannel;
}): ReactElement | null => {
  const { isEnabled } = useLfgEnabled();
  const { notificationSettings: ns, toggleSetting } = useNotificationSettings();

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <HorizontalSeparator className="mx-4" />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Looking for group
        </Typography>
        <NotificationContainer>
          {LFG_NOTIFICATIONS.map((item) => (
            <NotificationSwitch
              key={item.id}
              id={item.id}
              label={item.label}
              checked={
                ns?.[item.id]?.[channel] ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggle={() => toggleSetting(item.id, channel)}
            />
          ))}
        </NotificationContainer>
      </NotificationSection>
    </>
  );
};
