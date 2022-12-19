import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { NextSeo } from 'next-seo';
import { useInfiniteQuery, InfiniteData, useMutation } from 'react-query';
import {
  NotificationsData,
  NotificationType,
  NOTIFICATIONS_QUERY,
  READ_NOTIFICATIONS_MUTATION,
  NotificationIcon,
} from '@dailydotdev/shared/src/graphql/notifications';
import {
  pageContainerClassNames,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import EnableNotification from '@dailydotdev/shared/src/components/notifications/EnableNotification';
import { getLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/MainLayout';

import ProtectedPage from '../components/ProtectedPage';

const hasUnread = (data: InfiniteData<NotificationsData>) =>
  data.pages.some((page) =>
    page.notifications.edges.some(({ node }) => !node.readAt),
  );

const Notifications = (): ReactElement => {
  const seo = <NextSeo title="Notifications" nofollow noindex />;
  const { mutateAsync: readNotifications } = useMutation(() =>
    request(`${apiUrl}/graphql`, READ_NOTIFICATIONS_MUTATION),
  );
  const queryResult = useInfiniteQuery<NotificationsData>(
    ['notifications'],
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, NOTIFICATIONS_QUERY, {
        first: 100,
        after: pageParam,
      }),
    {
      getNextPageParam: (lastPage) =>
        lastPage?.notifications?.pageInfo?.hasNextPage &&
        lastPage?.notifications?.pageInfo?.endCursor,
      onSuccess: (data) => {
        if (hasUnread(data)) {
          readNotifications();
        }
      },
    },
  );

  const length = queryResult?.data?.pages?.length ?? 0;

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
        {length > 0 &&
          queryResult.data.pages.map((page) =>
            page.notifications.edges.map(
              ({ node: { id, readAt, ...props } }) => (
                <NotificationItem key={id} isUnread={!readAt} {...props} />
              ),
            ),
          )}
        {(!length || !queryResult.hasNextPage) && (
          <NotificationItem
            isUnread
            type={NotificationType.System}
            icon={NotificationIcon.Bell}
            title="Welcome to your new notification center!"
            description="The notification system notifies you of important events such as replies, mentions, updates etc."
          />
        )}
      </main>
    </ProtectedPage>
  );
};

const getNotificationsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

Notifications.getLayout = getNotificationsLayout;

export default Notifications;
