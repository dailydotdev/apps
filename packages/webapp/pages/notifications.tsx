import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import type { NextSeoProps } from 'next-seo';
import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import type {
  Notification,
  NotificationsData,
} from '@dailydotdev/shared/src/graphql/notifications';
import {
  NOTIFICATIONS_QUERY,
  READ_NOTIFICATIONS_MUTATION,
} from '@dailydotdev/shared/src/graphql/notifications';
import {
  pageBorders,
  pageContainerClassNames,
} from '@dailydotdev/shared/src/components/utilities';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import FirstNotification from '@dailydotdev/shared/src/components/notifications/FirstNotification';
import EnableNotification from '@dailydotdev/shared/src/components/notifications/EnableNotification';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import InfiniteScrolling, {
  checkFetchMore,
} from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { NotificationType } from '@dailydotdev/shared/src/components/notifications/utils';
import { usePromotionModal } from '@dailydotdev/shared/src/hooks/notifications/usePromotionModal';
import { useTopReaderModal } from '@dailydotdev/shared/src/hooks/modals/useTopReaderModal';
import { usePushNotificationContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useStreakRecoverModal } from '@dailydotdev/shared/src/hooks/notifications/useStreakRecoverModal';
import { getNextPageParam } from '@dailydotdev/shared/src/lib/query';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';

const hasUnread = (data: InfiniteData<NotificationsData>) =>
  data.pages.some((page) =>
    page.notifications.edges.some(({ node }) => !node.readAt),
  );

const seo: NextSeoProps = {
  title: 'Notifications',
  noindex: true,
  nofollow: true,
};

const Notifications = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { clearUnreadCount } = useNotificationContext();
  const { isSubscribed } = usePushNotificationContext();

  const { mutateAsync: readNotifications } = useMutation({
    mutationFn: () => gqlClient.request(READ_NOTIFICATIONS_MUTATION),
    onSuccess: clearUnreadCount,
  });
  const queryResult = useInfiniteQuery<NotificationsData>({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) =>
      gqlClient.request(NOTIFICATIONS_QUERY, {
        first: 100,
        after: pageParam,
      }),
    initialPageParam: '',
    getNextPageParam: ({ notifications }) =>
      getNextPageParam(notifications?.pageInfo),
  });

  useEffect(() => {
    if (queryResult.data && hasUnread(queryResult.data)) {
      readNotifications();
    }
  }, [queryResult.data, readNotifications]);

  const { isFetchedAfterMount, isFetched, hasNextPage } = queryResult ?? {};

  const length = queryResult?.data?.pages?.length ?? 0;

  const onNotificationClick = ({ id, type }: Notification) => {
    logEvent({
      event_name: LogEvent.ClickNotification,
      target_id: id,
      extra: JSON.stringify({ origin: Origin.NonRealTime, type }),
    });
  };

  useEffect(() => {
    if (!isFetchedAfterMount) {
      return;
    }

    logEvent({ event_name: LogEvent.OpenNotificationList });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchedAfterMount]);

  usePromotionModal();
  useStreakRecoverModal();
  useTopReaderModal();

  return (
    <ProtectedPage>
      <main
        className={classNames(pageBorders, pageContainerClassNames, 'pb-12')}
      >
        <EnableNotification />
        <h2
          className="p-6 font-bold typo-body"
          data-testid="notification_page-title"
        >
          Notifications
        </h2>
        <InfiniteScrolling
          isFetchingNextPage={queryResult.isFetchingNextPage}
          canFetchMore={checkFetchMore(queryResult)}
          fetchNextPage={queryResult.fetchNextPage}
        >
          {length > 0 &&
            queryResult.data.pages.map((page) =>
              page.notifications.edges.reduce((nodes, { node }) => {
                const { id, readAt, type, ...props } = node;

                if (
                  isSubscribed &&
                  type === NotificationType.SquadSubscribeNotification
                ) {
                  return nodes;
                }

                nodes.push(
                  <NotificationItem
                    key={id}
                    {...props}
                    type={type}
                    isUnread={!readAt}
                    onClick={() => onNotificationClick(node)}
                  />,
                );

                return nodes;
              }, []),
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
Notifications.layoutProps = { seo };

export default Notifications;
