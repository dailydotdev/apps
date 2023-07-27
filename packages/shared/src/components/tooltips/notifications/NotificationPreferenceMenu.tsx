import React, { ReactElement, useState } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import PortalMenu from '../../fields/PortalMenu';
import { Loader } from '../../Loader';
import {
  Notification,
  notificationPreferenceMap,
  NotificationPreferenceStatus,
} from '../../../graphql/notifications';
import BellIcon from '../../icons/Bell';
import BellDisabledIcon from '../../icons/Bell/Disabled';
import { notificationMutingCopy } from '../../notifications/utils';
import { useNotificationPreference } from '../../../hooks/notifications';

interface NotificationPreferenceMenuProps {
  contextId: string;
  notification: Notification;
}

export const NotificationPreferenceMenu = ({
  contextId,
}: NotificationPreferenceMenuProps): ReactElement => {
  const [notification, setNotification] = useState<Notification>();
  const {
    preferences,
    isFetching,
    clearNotificationPreference,
    muteNotification,
  } = useNotificationPreference({
    params: notification
      ? [
          {
            type: notificationPreferenceMap[notification.type],
            referenceId: notification.referenceId,
          },
        ]
      : [],
  });

  const onItemClick = () => {
    const isMuted =
      preferences?.[0]?.status === NotificationPreferenceStatus.Muted;
    const preferenceCommand = isMuted
      ? clearNotificationPreference
      : muteNotification;

    return preferenceCommand({
      type: notification.type,
      referenceId: notification.referenceId,
    });
  };

  const Icon = (): ReactElement => {
    if (isFetching) return <Loader />;

    const NotifIcon =
      preferences[0]?.status === NotificationPreferenceStatus.Muted
        ? BellIcon
        : BellDisabledIcon;

    return <NotifIcon />;
  };

  const Copy = (): ReactElement => {
    if (isFetching) return <>Fetching your preference</>;

    const isMuted =
      preferences[0]?.status === NotificationPreferenceStatus.Muted;
    const copy = notificationMutingCopy[notification?.type];

    return <>{isMuted ? copy.unmute : copy.mute}</>;
  };

  return (
    <PortalMenu
      disableBoundariesCheck
      id={contextId}
      className="menu-primary"
      animation="fade"
      onHidden={() => setNotification(undefined)}
    >
      <Item className="py-1 w-64 typo-callout" onClick={onItemClick}>
        <span className="flex flex-row gap-1 items-center w-full">
          <Icon />
          <Copy />
        </span>
      </Item>
    </PortalMenu>
  );
};
