import React, { ReactElement, useEffect } from 'react';
import classNames from 'classnames';
import { NextSeo } from 'next-seo';
import { useInfiniteQuery, InfiniteData, useMutation } from 'react-query';
import {
  NotificationsData,
  NOTIFICATIONS_QUERY,
  NotificationType,
  READ_NOTIFICATIONS_MUTATION,
} from '@dailydotdev/shared/src/graphql/notifications';
import {
  pageContainerClassNames,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import FirstNotification from '@dailydotdev/shared/src/components/notifications/FirstNotification';
import EnableNotification from '@dailydotdev/shared/src/components/notifications/EnableNotification';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import InfiniteScrolling from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { AnalyticsEvent, Origin } from '@dailydotdev/shared/src/lib/analytics';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';

import ProtectedPage from '../components/ProtectedPage';

const hasUnread = (data: InfiniteData<NotificationsData>) =>
  data.pages.some((page) =>
    page.notifications.edges.some(({ node }) => !node.readAt),
  );

const Notifications = (): ReactElement => {
  const seo = <NextSeo title="Notifications" nofollow noindex />;
  const { trackEvent } = useAnalyticsContext();
  const { clearUnreadCount } = useNotificationContext();
  const { mutateAsync: readNotifications } = useMutation(
    () => request(`${apiUrl}/graphql`, READ_NOTIFICATIONS_MUTATION),
    { onSuccess: clearUnreadCount },
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
  const { isFetchedAfterMount, isFetched, hasNextPage } = queryResult ?? {};

  const length = queryResult?.data?.pages?.length ?? 0;

  const onNotificationClick = (id: string, type: NotificationType) => {
    trackEvent({
      event_name: AnalyticsEvent.ClickNotification,
      target_id: id,
      extra: JSON.stringify({ origin: Origin.NonRealTime, type }),
    });
  };

  useEffect(() => {
    if (!isFetchedAfterMount) {
      return;
    }

    trackEvent({ event_name: AnalyticsEvent.OpenNotificationList });
  }, [isFetchedAfterMount]);

  return (
    <ProtectedPage seo={seo}>
      <main
        className={classNames(
          pageBorders,
          pageContainerClassNames,
          'laptop:min-h-screen pb-12',
        )}
      >
        <EnableNotification />
        <h2
          className="p-6 font-bold typo-headline"
          data-testid="notification_page-title"
        >
          Notifications
        </h2>
        <InfiniteScrolling queryResult={queryResult}>
          {length > 0 &&
            queryResult.data.pages.map((page) =>
              page.notifications.edges.map(
                ({ node: { id, readAt, type, ...props } }) => (
                  <NotificationItem
                    key={id}
                    {...props}
                    type={type}
                    isUnread={!readAt}
                    onClick={() => onNotificationClick(id, type)}
                  />
                ),
              ),
            )}
          {(!length || !hasNextPage) && isFetched && <FirstNotification />}
        </InfiniteScrolling>
      </main>
    </ProtectedPage>
  );
};

const getNotificationsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

Notifications.getLayout = getNotificationsLayout;

export default Notifications;
