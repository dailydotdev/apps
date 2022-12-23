import React, { ReactElement } from 'react';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { getUnreadTitle } from '@dailydotdev/shared/src/components/notifications/utils';

interface TitleProps {
  children: string;
}

function Title({ children }: TitleProps): ReactElement {
  const { unreadCount } = useNotificationContext();

  return <title>{getUnreadTitle(unreadCount, children)}</title>;
}

export default Title;
