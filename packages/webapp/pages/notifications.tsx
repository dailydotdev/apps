import React, { ReactElement, useEffect, useState } from 'react';
import classNames from 'classnames';
import { NextSeo } from 'next-seo';
import { InfiniteData, useInfiniteQuery, useMutation } from 'react-query';
import {
  Notification,
  notificationPreferenceMap,
  NotificationPreferenceStatus,
  NOTIFICATIONS_QUERY,
  NotificationsData,
  READ_NOTIFICATIONS_MUTATION,
} from '@dailydotdev/shared/src/graphql/notifications';
import {
  pageBorders,
  pageContainerClassNames,
} from '@dailydotdev/shared/src/components/utilities';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import FirstNotification from '@dailydotdev/shared/src/components/notifications/FirstNotification';
import EnableNotification from '@dailydotdev/shared/src/components/notifications/EnableNotification';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import InfiniteScrolling, {
  checkFetchMore,
} from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { AnalyticsEvent, Origin } from '@dailydotdev/shared/src/lib/analytics';
import {
  notificationMutingCopy,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { usePromotionModal } from '@dailydotdev/shared/src/hooks/notifications/usePromotionModal';
import { useNotificationPreference } from '@dailydotdev/shared/src/hooks/notifications';
import { Item, useContextMenu } from '@dailydotdev/react-contexify';
import PortalMenu from '@dailydotdev/shared/src/components/fields/PortalMenu';
import BellIcon from '@dailydotdev/shared/src/components/icons/Bell';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import BellDisabledIcon from '@dailydotdev/shared/src/components/icons/Bell/Disabled';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';

import ProtectedPage from '../components/ProtectedPage';

const hasUnread = (data: InfiniteData<NotificationsData>) =>
  data.pages.some((page) =>
    page.notifications.edges.some(({ node }) => !node.readAt),
  );

const contextId = 'notifications-context-menu';

const Notifications = (): ReactElement => {
  const seo = (
    <NextSeo
      title="Notifications"
      nofollow
      noindex
      titleTemplate="%s | daily.dev"
    />
  );
  const { trackEvent } = useAnalyticsContext();
  const { clearUnreadCount, isSubscribed } = useNotificationContext();
  const { mutateAsync: readNotifications } = useMutation(
    () => request(graphqlUrl, READ_NOTIFICATIONS_MUTATION),
    { onSuccess: clearUnreadCount },
  );
  const queryResult = useInfiniteQuery<NotificationsData>(
    ['notifications'],
    ({ pageParam }) =>
      request(graphqlUrl, NOTIFICATIONS_QUERY, {
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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchedAfterMount]);

  usePromotionModal();

  const { show } = useContextMenu({ id: contextId });
  const [notification, setNotification] = useState<Notification>();
  const {
    preferences,
    isFetching,
    clearNotificationPreference,
    muteNotification,
  } = useNotificationPreference({
    params: notification
      ? [
          {
            type: notificationPreferenceMap[notification.type],
            referenceId: notification.referenceId,
          },
        ]
      : [],
  });

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
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    show(e, { position: { x: right, y: bottom + 4 } });
  };

  const Icon = (): ReactElement => {
    if (isFetching) return <Loader />;

    const NotifIcon =
      preferences[0]?.status === NotificationPreferenceStatus.Muted
        ? BellIcon
        : BellDisabledIcon;

    return <NotifIcon />;
  };

  const Copy = (): ReactElement => {
    if (isFetching) return <>Fetching your preference</>;

    const isMuted =
      preferences[0]?.status === NotificationPreferenceStatus.Muted;
    const copy = notificationMutingCopy[notification?.type];

    return <>{isMuted ? copy.unmute : copy.mute}</>;
  };

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

  return (
    <ProtectedPage seo={seo}>
      <main
        className={classNames(pageBorders, pageContainerClassNames, 'pb-12')}
      >
        <EnableNotification />
        <h2
          className="p-6 font-bold typo-headline"
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
                    onClick={() => onNotificationClick(id, type)}
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
      <PortalMenu
        disableBoundariesCheck
        id={contextId}
        className="menu-primary"
        animation="fade"
        onHidden={() => setNotification(undefined)}
      >
        <Item className="py-1 w-64 typo-callout" onClick={onItemClick}>
          <span className="flex flex-row gap-1 items-center w-full">
            <Icon />
            <Copy />
          </span>
        </Item>
      </PortalMenu>
    </ProtectedPage>
  );
};

const getNotificationsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

Notifications.getLayout = getNotificationsLayout;

export default Notifications;
