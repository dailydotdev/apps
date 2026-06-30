import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { differenceInCalendarDays } from 'date-fns';
import classNames from 'classnames';
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
import { pageBorders, pageContainerClassNames } from '@dailydotdev/shared/src/components/utilities/common';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
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
import ProtectedPage from '../ProtectedPage';
import { NotificationFilterBar } from './NotificationFilterBar';

const hasUnread = (data: InfiniteData<NotificationsData>) =>
  data.pages.some((page) =>
    page.notifications.edges.some(({ node }) => !node.readAt),
  );

// Coarse time buckets (Instagram/TikTok/X style) that give the feed rhythm and
// breathing room without per-day noise. First match wins.
const TIME_GROUPS = [
  { key: 'today', label: 'Today', maxDays: 0 },
  { key: 'week', label: 'This week', maxDays: 7 },
  { key: 'month', label: 'This month', maxDays: 30 },
  { key: 'earlier', label: 'Earlier', maxDays: Number.POSITIVE_INFINITY },
] as const;

export const NotificationsFeed = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { clearUnreadCount } = useNotificationContext();
  const { isSubscribed } = usePushNotificationContext();
  const { shouldShowCta: showPushBanner } = useEnableNotification({
    source: NotificationPromptSource.NotificationsPage,
  });

  const router = useRouter();
  // Filtering is driven by the `?type=` query param so the sidebar rail panel
  // (a separate component tree) can control which category is shown.
  const activeCategory = useMemo<NotificationFilterCategory | null>(() => {
    const type = router.query?.type;
    const value = typeof type === 'string' ? type : undefined;
    return value &&
      notificationFilterCategoryList.includes(
        value as NotificationFilterCategory,
      )
      ? (value as NotificationFilterCategory)
      : null;
  }, [router.query?.type]);

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

  const onSelectCategory = useCallback(
    (category: NotificationFilterCategory | null) => {
      router.replace(
        {
          pathname: '/notifications',
          query: category ? { type: category } : {},
        },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );

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

  // The notifications API has no type filter yet, so we filter the already
  // loaded pages on the client. For the typical user every notification fits in
  // the first page; heavy users see the chips refine as more pages load.
  const filtered = useMemo(
    () =>
      activeCategory
        ? notifications.filter(
            (node) => getNotificationCategory(node.type) === activeCategory,
          )
        : notifications,
    [notifications, activeCategory],
  );

  const groups = useMemo(() => {
    const now = new Date();
    const byKey = new Map<string, Notification[]>();
    filtered.forEach((node) => {
      const days = differenceInCalendarDays(now, new Date(node.createdAt));
      // An invalid `createdAt` makes `days` NaN, which is `<=` nothing (not
      // even Infinity), so `.find` returns undefined — fall back to the last
      // bucket ("Earlier") instead of dropping the notification.
      const group =
        TIME_GROUPS.find((bucket) => days <= bucket.maxDays) ??
        TIME_GROUPS[TIME_GROUPS.length - 1];
      const list = byKey.get(group.key) ?? [];
      list.push(node);
      byKey.set(group.key, list);
    });
    return TIME_GROUPS.filter((bucket) => byKey.has(bucket.key)).map(
      (bucket) => ({
        ...bucket,
        items: byKey.get(bucket.key) as Notification[],
      }),
    );
  }, [filtered]);

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
          <div className="flex items-center justify-between p-6">
            <h2
              className="font-bold typo-body"
              data-testid="notification_page-title"
            >
              Notifications
            </h2>
            <Link href={`${webappUrl}notifications/settings`} passHref>
              <Button
                tag="a"
                icon={<SettingsIcon />}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                aria-label="Notification settings"
              />
            </Link>
          </div>
        )}
        {/* On v2 the type filters live in the sidebar rail panel; on the
            legacy/mobile layout (no rail) keep them as in-page tabs. */}
        {!isV2Laptop && (hasNotifications || !!activeCategory) && (
          <div className="border-b border-border-subtlest-tertiary px-4">
            <NotificationFilterBar
              categories={notificationFilterCategoryList}
              active={activeCategory}
              onSelect={onSelectCategory}
            />
          </div>
        )}
        <InfiniteScrolling
          isFetchingNextPage={queryResult.isFetchingNextPage}
          canFetchMore={checkFetchMore(queryResult)}
          fetchNextPage={queryResult.fetchNextPage}
        >
          {groups.map((group) => (
            <section key={group.key}>
              <h3 className="px-4 pb-1 pt-6 font-bold text-text-tertiary typo-footnote first:pt-4">
                {group.label}
              </h3>
              {group.items.map((node) => {
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
            </section>
          ))}
          {/* Filtering is client-side over loaded pages, so only claim a
              category is empty once every page has loaded — otherwise matches
              on a not-yet-fetched page would flash this message. */}
          {isFetched &&
            !hasNextPage &&
            filtered.length === 0 &&
            activeCategory && (
              <p className="px-4 py-10 text-center text-text-tertiary typo-callout">
                No{' '}
                {notificationFilterCategoryLabel[activeCategory].toLowerCase()}{' '}
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
