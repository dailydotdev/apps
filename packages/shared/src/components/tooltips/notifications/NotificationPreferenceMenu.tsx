import React, { ReactElement, useMemo } from 'react';
import ContextMenu from '../../fields/ContextMenu';
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
  isOpen: boolean;
}

export const NotificationPreferenceMenu = ({
  contextId,
  notification,
  onClose,
  isOpen,
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

  const label = useMemo((): string => {
    if (!notification) {
      return null;
    }

    if (isFetching) {
      return 'Fetching your preference';
    }

    const isMuted =
      preferences[0]?.status === NotificationPreferenceStatus.Muted;
    const copy = notificationMutingCopy[notification?.type];

    return isMuted ? copy.unmute : copy.mute;
  }, [notification, preferences, isFetching]);

  return (
    <ContextMenu
      disableBoundariesCheck
      id={contextId}
      className="menu-primary"
      animation="fade"
      onHidden={onClose}
      options={[{ icon: <Icon />, label, action: onItemClick }]}
      isOpen={isOpen}
    />
  );
};
