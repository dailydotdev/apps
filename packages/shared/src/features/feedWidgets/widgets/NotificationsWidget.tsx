import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useNotificationContext } from '../../../contexts/NotificationsContext';
import { usePushNotificationContext } from '../../../contexts/PushNotificationContext';
import type { Notification } from '../../../graphql/notifications';
import { latestNotificationsQueryOptions } from '../../../graphql/notifications';
import NotificationItem from '../../../components/notifications/NotificationItem';
import {
  getUnreadText,
  NotificationType,
} from '../../../components/notifications/utils';
import Link from '../../../components/utilities/Link';
import { webappUrl } from '../../../lib/constants';
import { LogEvent, Origin } from '../../../lib/log';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';

const notificationsPageUrl = `${webappUrl}notifications`;

/** The rows a Tall or Large widget lists; the rest wait on the page. */
const LIST_LENGTH = 8;

/** The reader's latest notifications, a glance at what the page lists. */
export const NotificationsWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.Notifications>): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { unreadCount } = useNotificationContext();
  const { isSubscribed } = usePushNotificationContext();
  const { data, isPending, refetch } = useQuery(
    latestNotificationsQueryOptions({ first: LIST_LENGTH, enabled: !!user }),
  );
  const isSmall = size === FeedWidgetSize.Small;

  // The layout's live subscription only bumps the count, so a new arrival
  // pulls the list again.
  const lastUnreadCount = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > lastUnreadCount.current) {
      refetch();
    }
    lastUnreadCount.current = unreadCount;
  }, [unreadCount, refetch]);

  const notifications = useMemo(
    () =>
      (data ?? [])
        .filter(
          (node) =>
            !(
              isSubscribed &&
              node.type === NotificationType.SquadSubscribeNotification
            ),
        )
        .slice(0, isSmall ? 1 : LIST_LENGTH),
    [data, isSmall, isSubscribed],
  );

  const onNotificationClick = useCallback(
    ({ id, type }: Notification) =>
      logEvent({
        event_name: LogEvent.ClickNotification,
        target_id: id,
        extra: JSON.stringify({ origin: Origin.FeedWidgets, type }),
      }),
    [logEvent],
  );

  const onSeeAllClick = () =>
    logEvent({
      event_name: LogEvent.ClickNotificationIcon,
      target_id: Origin.FeedWidgets,
      extra: JSON.stringify({ notifications_number: unreadCount }),
    });

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      data-size={size}
    >
      <header className="flex items-center gap-2 px-4 pb-2">
        <h3 className="font-bold text-text-primary typo-title3">
          Notifications
        </h3>
        {!!unreadCount && (
          <span
            className="rounded-6 bg-accent-cabbage-default px-1.5 font-bold text-white typo-caption1"
            aria-label={`${unreadCount} unread`}
          >
            {getUnreadText(unreadCount)}
          </span>
        )}
      </header>
      {notifications.length ? (
        <div
          className={classNames(
            'no-scrollbar flex min-h-0 flex-1 flex-col',
            isSmall
              ? 'overflow-hidden'
              : 'overflow-y-auto [mask-image:linear-gradient(to_bottom,black_calc(100%-1.25rem),transparent)]',
          )}
        >
          {notifications.map((notification) => {
            const { id, readAt, ...props } = notification;

            return (
              <NotificationItem
                key={id}
                {...props}
                // Opening the page marks everything read without touching
                // this cache, so a cleared count wins over a stale readAt.
                isUnread={!!unreadCount && !readAt}
                onClick={() => onNotificationClick(notification)}
                compact
                // A row with an action outgrows the Small cell.
                hideActions={isSmall}
              />
            );
          })}
        </div>
      ) : (
        <FeedWidgetEmpty
          kind={FeedWidgetKind.Notifications}
          isPending={!!user && isPending}
          message="No notifications yet."
        />
      )}
      <footer className="px-4 pt-2">
        <Link href={notificationsPageUrl} passHref>
          <a
            href={notificationsPageUrl}
            className="flex h-8 items-center text-text-tertiary typo-callout hover:text-text-primary"
            onClick={onSeeAllClick}
          >
            See all notifications
            <span aria-hidden className="ml-auto">
              →
            </span>
          </a>
        </Link>
      </footer>
    </div>
  );
};
