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
import { railTabClass, railTabLabelClass } from '../sidebar/common';

function NotificationsBell({
  compact,
  rail,
  noTooltip,
  railHideLabel,
  active,
}: {
  compact?: boolean;
  rail?: boolean;
  noTooltip?: boolean;
  // v2 rail compact mode: hide the "Alerts" label under the bell.
  railHideLabel?: boolean;
  // Optional override — the v2 sidebar wants the bell highlighted on
  // any page that owns the Notifications category (incl. its settings
  // sub-page), which extends past the bell's own internal check.
  active?: boolean;
}): ReactElement {
  const router = useRouter();
  // `router.pathname` exact-match drops on legitimate variations (trailing
  // slashes, locale prefixes, etc.), leaving the bell looking inactive on
  // the very page it points at. Match on the resolved path prefix instead
  // so the active styling fires reliably.
  const currentPath = (router.asPath ?? router.pathname ?? '').split('?')[0];
  const atNotificationsPage =
    active ??
    (currentPath === notificationsUrl ||
      currentPath.startsWith(`${notificationsUrl}/`));
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
              railTabClass,
              atNotificationsPage && 'bg-background-default !text-text-primary',
            )}
            onClick={onNavigateNotifications}
          >
            <span className="relative flex items-center justify-center">
              <BellIcon
                secondary={atNotificationsPage}
                size={IconSize.Small}
                aria-hidden
                className="pointer-events-none"
              />
              {hasNotification && (
                <Bubble className="-right-1 -top-1 cursor-pointer px-1">
                  {getUnreadText(unreadCount)}
                </Bubble>
              )}
            </span>
            {!railHideLabel && (
              <span className={railTabLabelClass}>Activity</span>
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
