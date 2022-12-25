import { getUnreadTitle } from '@dailydotdev/shared/src/components/notifications/utils';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { NextSeo, NextSeoProps } from 'next-seo';
import React, { ReactElement } from 'react';

function WebSeo({ title, ...props }: NextSeoProps): ReactElement {
  const { unreadCount } = useNotificationContext();
  return <NextSeo {...props} title={getUnreadTitle(unreadCount, title)} />;
}

export default WebSeo;
