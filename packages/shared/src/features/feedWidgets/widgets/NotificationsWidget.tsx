import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useNotificationContext } from '../../../contexts/NotificationsContext';
import { usePushNotificationContext } from '../../../contexts/PushNotificationContext';
import type { Notification } from '../../../graphql/notifications';
import {
  isNotificationVisible,
  latestNotificationsQueryOptions,
  NotificationAvatarType,
} from '../../../graphql/notifications';
import { useObjectPurify } from '../../../hooks/useDomPurify';
import { NotificationFollowUserButton } from '../../../components/notifications/NotificationFollowUserButton';
import { NotificationSayThanksButton } from '../../../components/notifications/NotificationSayThanksButton';
import NotificationItemIcon from '../../../components/notifications/NotificationIcon';
import { getNotificationLeadAvatar } from '../../../components/notifications/leadAvatar';
import {
  getUnreadText,
  NotificationType,
  notificationTypeNotClickable,
  notificationTypeTheme,
} from '../../../components/notifications/utils';
import { Image } from '../../../components/image/Image';
import Link from '../../../components/utilities/Link';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { IconSize } from '../../../components/Icon';
import { BellIcon } from '../../../components/icons/Bell';
import { publishTimeRelativeShort } from '../../../lib/dateFormat';
import { webappUrl } from '../../../lib/constants';
import { LogEvent, NotificationTarget, Origin } from '../../../lib/log';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';
import { useWidgetScroll } from '../useWidgetScroll';

const notificationsPageUrl = `${webappUrl}notifications`;

// The list scrolls, so one fetch covers every size.
const LIST_LENGTH = 8;

// The widget's own material: people reaching out, a warm purple from the
// badge.
const socialStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(90% 70% at 0% 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 24%, transparent) 0%, transparent 70%)',
};

const imageAvatarTypes = [
  NotificationAvatarType.User,
  NotificationAvatarType.Source,
  NotificationAvatarType.Organization,
];

const NotificationRow = ({
  notification,
  isUnread,
  isSmall,
  onClick,
}: {
  notification: Notification;
  isUnread: boolean;
  isSmall: boolean;
  onClick: () => void;
}): ReactElement | null => {
  const { type, icon, title, avatars, targetUrl, createdAt } = notification;
  const { isReady, title: safeTitle } = useObjectPurify({ title });
  if (!isReady) {
    return null;
  }

  const lead = getNotificationLeadAvatar(avatars?.filter(Boolean) ?? []);
  const isClickable = !notificationTypeNotClickable[type];
  // The actions outgrow a Small cell.
  const hasActions = !isSmall;

  return (
    <li className="relative flex snap-start items-start gap-2.5 rounded-12 px-2 py-1.5 transition-colors duration-150 hover:bg-surface-hover motion-reduce:transition-none">
      {isClickable && (
        <Link href={targetUrl} passHref>
          <a
            href={targetUrl}
            aria-label="Open notification"
            title="Open notification"
            data-testid="openNotification"
            className="absolute inset-0 rounded-12"
            onClick={onClick}
          >
            <span />
          </a>
        </Link>
      )}
      {lead && imageAvatarTypes.includes(lead.type) ? (
        <Image
          src={lead.image}
          alt=""
          className={classNames(
            'mt-0.5 shrink-0 rounded-max object-cover',
            isSmall ? 'size-6' : 'size-8',
          )}
        />
      ) : (
        <span
          className={classNames(
            'mt-0.5 flex shrink-0 items-center justify-center overflow-hidden rounded-max [&>*]:scale-75',
            isSmall ? 'size-6' : 'size-8',
          )}
        >
          <NotificationItemIcon
            icon={icon}
            iconTheme={notificationTypeTheme[type]}
          />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className="line-clamp-2 break-words text-text-primary typo-footnote [&_b]:font-bold [&_p]:m-0 [&_p]:inline [&_strong]:font-bold"
          // Purified above, like the notifications page.
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: safeTitle }}
        />
        {!!createdAt && (
          <span className="truncate text-text-tertiary typo-caption1">
            {publishTimeRelativeShort(createdAt)}
          </span>
        )}
        {hasActions && type === NotificationType.UserFollow && (
          <span className="relative z-1 mt-1">
            <NotificationFollowUserButton
              {...notification}
              origin={Origin.FeedWidgets}
            />
          </span>
        )}
        {hasActions && type === NotificationType.UserReceivedAward && (
          <span className="relative z-1 mt-1">
            <NotificationSayThanksButton
              referenceId={notification.referenceId}
              hasThanks={notification.hasThanks}
            />
          </span>
        )}
      </span>
      {isUnread && (
        <span
          aria-label="Unread"
          className="mt-1.5 size-2 shrink-0 rounded-max bg-accent-cabbage-default"
        />
      )}
    </li>
  );
};

/** The reader's latest notifications, a glance at what the page lists. */
export const NotificationsWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.Notifications>): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { unreadCount } = useNotificationContext();
  const { isSubscribed } = usePushNotificationContext();
  const scroll = useWidgetScroll();
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
      (data ?? []).filter((node) => isNotificationVisible(node, isSubscribed)),
    [data, isSubscribed],
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
      target_id: NotificationTarget.FeedWidgets,
      extra: JSON.stringify({ notifications_number: unreadCount }),
    });

  return (
    <div
      className="relative isolate flex min-h-0 min-w-0 flex-1 flex-col"
      data-size={size}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-1"
        style={socialStyle}
      />
      <header className="flex h-6 min-w-0 shrink-0 items-center gap-1.5 px-4">
        {unreadCount > 0 ? (
          <span
            aria-label={`${unreadCount} unread`}
            className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-6 bg-accent-cabbage-default px-1.5 font-bold tabular-nums text-white typo-caption2"
          >
            {getUnreadText(unreadCount)}
          </span>
        ) : (
          <BellIcon
            secondary
            size={IconSize.Size16}
            className="shrink-0 text-accent-bacon-default"
          />
        )}
        <span className="truncate font-bold text-text-primary typo-caption1">
          Notifications
        </span>
        <Link href={notificationsPageUrl} passHref>
          <Button
            tag="a"
            href={notificationsPageUrl}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            className="-mr-2 ml-auto"
            onClick={onSeeAllClick}
          >
            View all
          </Button>
        </Link>
      </header>
      {notifications.length ? (
        <div
          ref={scroll.ref}
          onScroll={scroll.onScroll}
          style={scroll.style}
          className={classNames('mt-2 px-2', scroll.className)}
        >
          <ul
            aria-label="Notifications"
            className={classNames(
              'gap-1',
              size === FeedWidgetSize.Large
                ? 'grid grid-cols-2 gap-x-4'
                : 'flex flex-col',
            )}
          >
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                // Opening the page marks everything read without touching
                // this cache, so a cleared count wins over a stale readAt.
                isUnread={!!unreadCount && !notification.readAt}
                isSmall={isSmall}
                onClick={() => onNotificationClick(notification)}
              />
            ))}
          </ul>
        </div>
      ) : (
        <FeedWidgetEmpty
          kind={FeedWidgetKind.Notifications}
          isPending={!!user && isPending}
          message="No notifications yet."
        />
      )}
    </div>
  );
};
