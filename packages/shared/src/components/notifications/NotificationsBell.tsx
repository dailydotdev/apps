import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { Button, ButtonIconPosition, ButtonVariant } from '../buttons/Button';
import { BellIcon } from '../icons';
import { Bubble } from '../tooltips/utils';
import { getUnreadText, notificationsUrl } from './utils';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { LogEvent, NotificationTarget } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { webappUrl } from '../../lib/constants';
import { useViewSize, ViewSize } from '../../hooks';
import { Tooltip } from '../tooltip/Tooltip';
import Link from '../utilities/Link';
import { IconSize } from '../Icon';

function NotificationsBell({
  compact,
  rail,
  noTooltip,
}: {
  compact?: boolean;
  rail?: boolean;
  noTooltip?: boolean;
}): ReactElement {
  const router = useRouter();
  const atNotificationsPage = router.pathname === notificationsUrl;
  const { logEvent } = useLogContext();
  const { unreadCount } = useNotificationContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const hasNotification = !!unreadCount;
  const onNavigateNotifications = () => {
    logEvent({
      event_name: LogEvent.ClickNotificationIcon,
      target_id: NotificationTarget.Header,
      extra: JSON.stringify({ notifications_number: unreadCount }),
    });
  };

  const mobileVariant = atNotificationsPage ? undefined : ButtonVariant.Option;

  if (rail) {
    const railLink = (
      <div>
        <Link href={`${webappUrl}notifications`} passHref>
          <a
            href={`${webappUrl}notifications`}
            aria-label="Notifications"
            className={classNames(
              'focus-outline relative flex h-10 w-10 items-center justify-center rounded-12 transition-colors hover:bg-surface-hover hover:text-text-primary',
              atNotificationsPage
                ? 'bg-background-default text-white'
                : 'text-text-tertiary',
            )}
            onClick={onNavigateNotifications}
          >
            <BellIcon
              secondary={atNotificationsPage}
              size={IconSize.Small}
              aria-hidden
              className="pointer-events-none"
            />
            {hasNotification && (
              <Bubble className="-right-1 top-0 cursor-pointer px-1">
                {getUnreadText(unreadCount)}
              </Bubble>
            )}
          </a>
        </Link>
      </div>
    );

    if (noTooltip) {
      return railLink;
    }

    return (
      <Tooltip side="right" content="Notifications">
        {railLink}
      </Tooltip>
    );
  }

  return (
    <Tooltip side="bottom" content="Notifications">
      <div>
        <Link href={`${webappUrl}notifications`} passHref>
          <Button
            variant={isLaptop ? ButtonVariant.Float : mobileVariant}
            className="relative w-10 justify-center"
            tag="a"
            aria-label="Notifications"
            iconPosition={ButtonIconPosition.Top}
            onClick={onNavigateNotifications}
            icon={<BellIcon secondary={atNotificationsPage} />}
          >
            {hasNotification && (
              <Bubble
                className={classNames(
                  '-right-1.5 -top-1.5 cursor-pointer px-1',
                  compact && 'right-0 top-0',
                )}
              >
                {getUnreadText(unreadCount)}
              </Bubble>
            )}
          </Button>
        </Link>
      </div>
    </Tooltip>
  );
}

export default NotificationsBell;
