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
import { useMobileUxExperiment } from '../../hooks/useMobileUxExperiment';
import { webappUrl } from '../../lib/constants';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';

function NotificationsBell({ compact }: { compact?: boolean }): ReactElement {
  const router = useRouter();
  const atNotificationsPage = router.pathname === notificationsUrl;
  const { trackEvent } = useAnalyticsContext();
  const { unreadCount } = useNotificationContext();
  const { isNewMobileLayout } = useMobileUxExperiment();
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
      <div
        className={classNames(
          'relative laptop:flex',
          !isNewMobileLayout && 'hidden',
        )}
      >
        <Button
          variant={isNewMobileLayout ? mobileVariant : ButtonVariant.Float}
          className={classNames(isNewMobileLayout && 'justify-center')}
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
