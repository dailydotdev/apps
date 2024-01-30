import React, { ReactElement } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import PortalMenu from '../../fields/PortalMenu';
import { Loader } from '../../Loader';
import {
  Notification,
  NotificationPreferenceStatus,
} from '../../../graphql/notifications';
import { BellIcon, BellDisabledIcon } from '../../icons';
import { notificationMutingCopy } from '../../notifications/utils';
import { useNotificationPreference } from '../../../hooks/notifications';

interface NotificationPreferenceMenuProps {
  contextId: string;
  notification: Notification;
  onClose(): void;
}

export const NotificationPreferenceMenu = ({
  contextId,
  notification,
  onClose,
}: NotificationPreferenceMenuProps): ReactElement => {
  const {
    preferences,
    isFetching,
    clearNotificationPreference,
    muteNotification,
  } = useNotificationPreference({
    params: notification
      ? [
          {
            notificationType: notification.type,
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
    if (!notification) {
      return null;
    }

    if (isFetching) {
      return <Loader />;
    }

    const NotifIcon =
      preferences[0]?.status === NotificationPreferenceStatus.Muted
        ? BellIcon
        : BellDisabledIcon;

    return <NotifIcon />;
  };

  const Copy = (): ReactElement => {
    if (!notification) {
      return null;
    }

    if (isFetching) {
      return <>Fetching your preference</>;
    }

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
      onHidden={onClose}
    >
      <Item className="w-64 py-1 typo-callout" onClick={onItemClick}>
        <span className="flex w-full flex-row items-center gap-1">
          <Icon />
          <Copy />
        </span>
      </Item>
    </PortalMenu>
  );
};
