import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { BellIcon } from '../icons';
import { Bubble } from '../tooltips/utils';
import { checkAtNotificationsPage, getUnreadText } from './utils';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { AnalyticsEvent, NotificationTarget } from '../../lib/analytics';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { useMobileUxExperiment } from '../../hooks/useMobileUxExperiment';
import { webappUrl } from '../../lib/constants';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';

function NotificationsBell({ compact }: { compact?: boolean }): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const { unreadCount } = useNotificationContext();
  const { isNewMobileLayout } = useMobileUxExperiment();
  const hasNotification = !!unreadCount;
  const atNotificationsPage = checkAtNotificationsPage();
  const onNavigateNotifications = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickNotificationIcon,
      target_id: NotificationTarget.Header,
      extra: JSON.stringify({ notifications_number: unreadCount }),
    });
  };

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
          variant={
            isNewMobileLayout ? ButtonVariant.Option : ButtonVariant.Float
          }
          onClick={onNavigateNotifications}
          icon={
            <BellIcon
              className={classNames(
                'hover:text-theme-label-primary',
                atNotificationsPage && 'text-theme-label-primary',
              )}
              secondary={atNotificationsPage}
            />
          }
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
