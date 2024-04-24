import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { Button, ButtonVariant } from '../buttons/Button';
import { BellIcon } from '../icons';
import { Bubble } from '../tooltips/utils';
import { getUnreadText, notificationsUrl } from './utils';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { AnalyticsEvent, NotificationTarget } from '../../lib/analytics';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { webappUrl } from '../../lib/constants';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { useViewSize, ViewSize } from '../../hooks';

function NotificationsBell({ compact }: { compact?: boolean }): ReactElement {
  const router = useRouter();
  const atNotificationsPage = router.pathname === notificationsUrl;
  const { trackEvent } = useAnalyticsContext();
  const { unreadCount } = useNotificationContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const hasNotification = !!unreadCount;
  const onNavigateNotifications = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickNotificationIcon,
      target_id: NotificationTarget.Header,
      extra: JSON.stringify({ notifications_number: unreadCount }),
    });
  };

  const mobileVariant = atNotificationsPage ? undefined : ButtonVariant.Option;

  return (
    <LinkWithTooltip
      tooltip={{ placement: 'bottom', content: 'Notifications' }}
      href={`${webappUrl}notifications`}
    >
      <div className="relative laptop:hidden">
        <Button
          variant={isLaptop ? ButtonVariant.Float : mobileVariant}
          className="justify-center laptop:justify-normal"
          onClick={onNavigateNotifications}
          icon={<BellIcon secondary={atNotificationsPage} />}
        />
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
      </div>
    </LinkWithTooltip>
  );
}

export default NotificationsBell;
