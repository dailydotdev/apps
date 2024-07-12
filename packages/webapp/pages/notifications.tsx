import React, { ReactElement, useEffect, useState } from 'react';
import classNames from 'classnames';
import { NextSeo } from 'next-seo';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
} from '@tanstack/react-query';
import {
  Notification,
  NOTIFICATIONS_QUERY,
  NotificationsData,
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
import useContextMenu from '@dailydotdev/shared/src/hooks/useContextMenu';
import InfiniteScrolling, {
  checkFetchMore,
} from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import {
  notificationMutingCopy,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { usePromotionModal } from '@dailydotdev/shared/src/hooks/notifications/usePromotionModal';
import { NotificationPreferenceMenu } from '@dailydotdev/shared/src/components/tooltips/notifications';
import { usePushNotificationContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';

const hasUnread = (data: InfiniteData<NotificationsData>) =>
  data.pages.some((page) =>
    page.notifications.edges.some(({ node }) => !node.readAt),
  );

const contextId = 'notifications-context-menu';
const seo = (
  <NextSeo
    title="Notifications"
    nofollow
    noindex
    titleTemplate="%s | daily.dev"
  />
);

const Notifications = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { clearUnreadCount } = useNotificationContext();
  const { isSubscribed } = usePushNotificationContext();

  const { mutateAsync: readNotifications } = useMutation(
    () => gqlClient.request(READ_NOTIFICATIONS_MUTATION),
    { onSuccess: clearUnreadCount },
  );
  const queryResult = useInfiniteQuery<NotificationsData>(
    ['notifications'],
    ({ pageParam }) =>
      gqlClient.request(NOTIFICATIONS_QUERY, {
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

  const { onMenuClick: showOptionsMenu, isOpen } = useContextMenu({
    id: contextId,
  });
  const [notification, setNotification] = useState<Notification>();

  const onOptionsClick = (e: React.MouseEvent, item: Notification) => {
    e.preventDefault();

    if (notification) {
      const { referenceId, type } = notification;
      const clickedSameButton =
        referenceId === item.referenceId && type === item.type;
      setNotification(clickedSameButton ? undefined : item);
      return;
    }

    setNotification(item);
    showOptionsMenu(e);
  };

  return (
    <ProtectedPage seo={seo}>
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
                    onOptionsClick={
                      Object.keys(notificationMutingCopy).includes(type)
                        ? (e) => onOptionsClick(e, node)
                        : undefined
                    }
                  />,
                );

                return nodes;
              }, []),
            )}
          {(!length || !hasNextPage) && isFetched && <FirstNotification />}
        </InfiniteScrolling>
      </main>
      <NotificationPreferenceMenu
        isOpen={isOpen}
        contextId={contextId}
        notification={notification}
        onClose={() => setNotification(undefined)}
      />
    </ProtectedPage>
  );
};

const getNotificationsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

Notifications.getLayout = getNotificationsLayout;

export default Notifications;
