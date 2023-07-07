import React, { ReactElement, useEffect } from 'react';
import usePersistentContext from '../../hooks/usePersistentContext';
import { firstNotificationLink } from '../../lib/constants';
import NotificationItem from './NotificationItem';
import { NotificationType, NotificationIconType } from './utils';

const READ_KEY = 'FIRST_NOTIFICATION_READ';

function FirstNotification(): ReactElement {
  const [isUnread, setIsUnread] = usePersistentContext(READ_KEY, true);

  useEffect(() => {
    return () => {
      setIsUnread(false);
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NotificationItem
      isUnread={isUnread}
      type={NotificationType.System}
      icon={NotificationIconType.Bell}
      targetUrl={firstNotificationLink}
      title="Welcome to your new notification center!"
      description="The notification system notifies you of important events such as replies, mentions, updates etc."
    />
  );
}

export default FirstNotification;
