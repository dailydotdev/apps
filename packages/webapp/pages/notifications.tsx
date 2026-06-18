import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
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
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import FirstNotification from '@dailydotdev/shared/src/components/notifications/FirstNotification';
import EnableNotification from '@dailydotdev/shared/src/components/notifications/EnableNotification';
import { DigestUpsellBanner } from '@dailydotdev/shared/src/components/marketing/banners/DigestUpsellBanner';
import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import InfiniteScrolling, {
  checkFetchMore,
} from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  NotificationPromptSource,
  Origin,
} from '@dailydotdev/shared/src/lib/log';
import {
  getNotificationCategory,
  notificationFilterCategoryLabel,
  notificationFilterCategoryList,
  NotificationType,
  type NotificationFilterCategory,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { usePromotionModal } from '@dailydotdev/shared/src/hooks/notifications/usePromotionModal';
import { useTopReaderModal } from '@dailydotdev/shared/src/hooks/modals/useTopReaderModal';
import { usePushNotificationContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { useEnableNotification } from '@dailydotdev/shared/src/hooks/notifications/useEnableNotification';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useStreakRecoverModal } from '@dailydotdev/shared/src/hooks/notifications/useStreakRecoverModal';
import { getNextPageParam } from '@dailydotdev/shared/src/lib/query';
import { useCampaignByIdModal } from '@dailydotdev/shared/src/hooks/notifications';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';
import { NotificationFilterBar } from '../components/notifications/NotificationFilterBar';

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
  const { shouldShowCta: showPushBanner } = useEnableNotification({
    source: NotificationPromptSource.NotificationsPage,
  });

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

  const [activeCategory, setActiveCategory] =
    useState<NotificationFilterCategory | null>(null);

  // The notifications API has no server-side type filter, so we filter the
  // already-loaded pages on the client. For the typical user every
  // notification fits in the first page; heavy users see the chips refine as
  // more pages load via infinite scroll.
  const notifications = useMemo<Notification[]>(() => {
    const pages = queryResult?.data?.pages ?? [];
    return pages.flatMap((page) =>
      page.notifications.edges
        .map(({ node }) => node)
        .filter(
          (node) =>
            !(
              isSubscribed &&
              node.type === NotificationType.SquadSubscribeNotification
            ),
        ),
    );
  }, [queryResult?.data?.pages, isSubscribed]);

  const filtered = useMemo(
    () =>
      activeCategory
        ? notifications.filter(
            (node) => getNotificationCategory(node.type) === activeCategory,
          )
        : notifications,
    [notifications, activeCategory],
  );

  const hasNotifications = notifications.length > 0;

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

  useCampaignByIdModal();
  usePromotionModal();
  useStreakRecoverModal();
  useTopReaderModal();
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2;

  return (
    <ProtectedPage>
      {isV2Laptop && <PageHeader title="Notifications" />}
      <main
        className={classNames(
          !isV2Laptop && pageBorders,
          pageContainerClassNames,
          'pb-12',
        )}
      >
        <EnableNotification />
        {!showPushBanner && <DigestUpsellBanner />}
        {!isV2Laptop && (
          <h2
            className="p-6 font-bold typo-body"
            data-testid="notification_page-title"
          >
            Notifications
          </h2>
        )}
        {hasNotifications && (
          <NotificationFilterBar
            categories={notificationFilterCategoryList}
            active={activeCategory}
            onSelect={setActiveCategory}
          />
        )}
        <InfiniteScrolling
          isFetchingNextPage={queryResult.isFetchingNextPage}
          canFetchMore={checkFetchMore(queryResult)}
          fetchNextPage={queryResult.fetchNextPage}
        >
          {filtered.map((node) => {
            const { id, createdAt, readAt, type, ...props } = node;

            return (
              <NotificationItem
                key={id}
                {...props}
                type={type}
                isUnread={!readAt}
                onClick={() => onNotificationClick(node)}
                createdAt={createdAt}
              />
            );
          })}
          {isFetched && filtered.length === 0 && activeCategory && (
            <p className="px-4 py-10 text-center text-text-tertiary typo-callout">
              No {notificationFilterCategoryLabel[activeCategory].toLowerCase()}{' '}
              notifications yet.
            </p>
          )}
          {isFetched &&
            !activeCategory &&
            (!hasNotifications || !hasNextPage) && <FirstNotification />}
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
