import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { NextSeo } from 'next-seo';
import {
  pageContainerClassNames,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import EnableNotification from '@dailydotdev/shared/src/components/notifications/EnableNotification';
import { getLayout } from '../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import ProtectedPage from '../components/ProtectedPage';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { NotificationType } from '@dailydotdev/shared/src/graphql/notifications';

const Notifications = (): ReactElement => {
  const seo = <NextSeo title="Notifications" nofollow noindex />;

  return (
    <ProtectedPage seo={seo}>
      <main
        className={classNames(
          pageBorders,
          pageContainerClassNames,
          'laptop:min-h-screen',
        )}
      >
        <EnableNotification />
        <h2 className="p-6 font-bold typo-headline">Notifications</h2>
        <NotificationItem
          isUnread
          type={NotificationType.System}
          icon={cloudinary.notifications.bell}
          title="Welcome to your new notification center!"
          description="The notification system notifies you of important events such as
              replies, mentions, updates etc."
        />
      </main>
    </ProtectedPage>
  );
};

const getNotificationsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

Notifications.getLayout = getNotificationsLayout;

export default Notifications;
