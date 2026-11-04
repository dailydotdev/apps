import type { ReactElement } from 'react';
import React from 'react';
import { Typography, TypographyType } from '../typography/Typography';
import { HorizontalSeparator } from '../utilities';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import { useLiveChatEnabled } from '../../features/liveChat/hooks/useLiveChatEnabled';
import {
  LIVE_CHAT_NOTIFICATIONS,
  NotificationContainer,
  NotificationSection,
} from './utils';
import NotificationSwitch from './NotificationSwitch';

// Only readers inside live chat get its pushes, so only they see the
// section. The push follows the in-app choice, like the other switches on
// this tab; there is no email for it.
export const LiveChatNotificationSettings = (): ReactElement | null => {
  const { isEnabled } = useLiveChatEnabled();
  const { notificationSettings: ns, toggleSetting } = useNotificationSettings();

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <HorizontalSeparator className="mx-4" />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Live chats
        </Typography>
        <NotificationContainer>
          {LIVE_CHAT_NOTIFICATIONS.map((item) => (
            <NotificationSwitch
              key={item.id}
              id={item.id}
              label={item.label}
              description={item.description}
              checked={
                ns?.[item.id]?.inApp === NotificationPreferenceStatus.Subscribed
              }
              onToggle={() => toggleSetting(item.id, 'inApp')}
            />
          ))}
        </NotificationContainer>
      </NotificationSection>
    </>
  );
};
