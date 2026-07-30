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
import {
  RAIL_ICON_SIZE,
  railTabClass,
  railTabLabelClass,
} from '../sidebar/common';

// The count itself: one step down from `Bubble`'s own size and bolder, so the
// number stays legible without overpowering the bell glyph it notches, and
// `tabular-nums` stops the badge reflowing as the count ticks. Shared by both
// bell variants so the header and the v2 rail stay identical. `Bubble` already
// supplies the 20px box and the 8px radius.
const notificationBubbleClass = '!font-bold !typo-footnote tabular-nums';

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
            // It's a tab in the rail tablist; the role makes `aria-selected`
            // valid and lets the v2 rail's shared sliding pill track this tab
            // like the others (the pill renders the selected background, so here
            // we only own the active text color).
            role="tab"
            aria-selected={atNotificationsPage}
            // Every other rail tab is a <button>; this one is an anchor, which
            // browsers drag natively. That native link-drag ran alongside the
            // rail's dnd-kit reorder and navigated on drop — reloading
            // /notifications. Only dnd-kit should drive this drag.
            draggable={false}
            className={classNames(
              railTabClass,
              atNotificationsPage && '!text-text-primary',
            )}
            onClick={onNavigateNotifications}
          >
            <span className="relative flex items-center justify-center">
              <BellIcon
                secondary={atNotificationsPage}
                size={RAIL_ICON_SIZE}
                aria-hidden
                className="pointer-events-none"
              />
              {hasNotification && (
                // The shared square Bubble is the design-system badge (see the
                // Bell Storybook "Count bubble" reference), offset so it notches
                // the bell's corner without blanketing the glyph.
                <Bubble
                  className={classNames(
                    // Anchored by its LEFT edge (the bell box is 24px, so 10px
                    // sits just left of centre): multi-digit counts grow
                    // rightward instead of creeping left across the bell glyph,
                    // and starting left of centre keeps even "20+" inside the
                    // rail's width.
                    'pointer-events-none -top-2 left-2.5 px-1',
                    notificationBubbleClass,
                  )}
                >
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
                  notificationBubbleClass,
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
