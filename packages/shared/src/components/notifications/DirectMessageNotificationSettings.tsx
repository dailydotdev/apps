import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import Link from '../utilities/Link';
import { HorizontalSeparator } from '../utilities';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import { useMessagesEnabled } from '../../features/messages/hooks/useMessagesEnabled';
import { useDmSettings } from '../../features/messages/hooks/useDmSettings';
import { settingsUrl } from '../../lib/constants';
import {
  DIRECT_MESSAGE_NOTIFICATIONS,
  NotificationContainer,
  NotificationSection,
} from './utils';
import NotificationSwitch from './NotificationSwitch';

// Only people in the direct messages rollout get its notifications, so only
// they see the section. The switch that turns messaging off altogether sits
// with them: it's the one people look for first.
export const DirectMessageNotificationSettings = (): ReactElement | null => {
  const { isEnabled } = useMessagesEnabled();
  const { allowsMessages, isFetched, setAllowsMessages } = useDmSettings({
    enabled: isEnabled,
  });
  const { notificationSettings: ns, toggleSetting } = useNotificationSettings();

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <HorizontalSeparator className="mx-4" />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Direct messages
        </Typography>
        <NotificationContainer>
          <NotificationSwitch
            id="allow_direct_messages"
            label="Allow direct messages"
            description="When this is off, nobody can message you and you can't send messages. Users you block can never message you."
            checked={allowsMessages}
            // Until the real value loads the switch would show "on" for users
            // who turned DMs off, and a click would act on that guess.
            disabled={!isFetched}
            onToggle={() => setAllowsMessages(!allowsMessages)}
          />
          <Link href={`${settingsUrl}/feed/filters`} passHref>
            <Typography tag={TypographyTag.Link} type={TypographyType.Callout}>
              Manage blocked users →
            </Typography>
          </Link>
          {DIRECT_MESSAGE_NOTIFICATIONS.map((item) => (
            <NotificationSwitch
              key={item.id}
              id={item.id}
              label={item.label}
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
