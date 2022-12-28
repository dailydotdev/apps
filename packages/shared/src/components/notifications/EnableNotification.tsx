import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import usePersistentContext from '../../hooks/usePersistentContext';
import { Button } from '../buttons/Button';
import NotificationsContext from '../../contexts/NotificationsContext';
import CloseButton from '../CloseButton';
import { cloudinary } from '../../lib/image';
import VIcon from '../icons/V';
import { webappUrl } from '../../lib/constants';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';

export enum NotificationPromptSource {
  NotificationsPage = 'notifications page',
  NewComment = 'new comment',
  CommunityPicks = 'community picks modal',
}

const DISMISS_PERMISSION_BANNER = 'DISMISS_PERMISSION_BANNER';

type EnableNotificationProps = {
  source?: NotificationPromptSource;
  parentCommentAuthorName?: string;
};

const containerClassName: Record<NotificationPromptSource, string> = {
  [NotificationPromptSource.NotificationsPage]:
    'px-6 w-full border-l bg-theme-float',
  [NotificationPromptSource.NewComment]: 'rounded-16 border px-4 mt-3',
  [NotificationPromptSource.CommunityPicks]: 'rounded-16 border px-4 mt-3',
};

function EnableNotification({
  source = NotificationPromptSource.NotificationsPage,
  parentCommentAuthorName,
}: EnableNotificationProps): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const {
    isSubscribed,
    isNotificationSupported,
    hasPermissionCache,
    acceptedPermissionJustNow: isEnabled,
    onTogglePermission,
    onAcceptedPermissionJustNow,
  } = useContext(NotificationsContext);
  const [isDismissed, setIsDismissed, isLoaded] = usePersistentContext(
    DISMISS_PERMISSION_BANNER,
    false,
  );
  const onDismiss = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickNotificationDismiss,
      extra: JSON.stringify({ origin: source }),
    });
    setIsDismissed(true);
  };

  const onEnable = async () => {
    const permission = await onTogglePermission();

    trackEvent({
      event_name: AnalyticsEvent.ClickEnableNotification,
      extra: JSON.stringify({ origin: source, permission }),
    });

    if (permission === null) {
      return;
    }

    const isGranted = permission === 'granted';

    onAcceptedPermissionJustNow?.(isGranted);
  };

  const hasEnabled = (isSubscribed || hasPermissionCache) && isEnabled;

  useEffect(() => {
    return () => {
      onAcceptedPermissionJustNow?.(false);
    };
  }, []);

  if (
    !isLoaded ||
    isDismissed ||
    !isNotificationSupported ||
    ((isSubscribed || hasPermissionCache) && !isEnabled)
  ) {
    return null;
  }

  const sourceToMessage: Record<NotificationPromptSource, string> = {
    [NotificationPromptSource.NewComment]: `Want to get notified when ${
      parentCommentAuthorName ?? 'someone'
    } responds so you can continue the conversation?`,
    [NotificationPromptSource.CommunityPicks]:
      'Would you like to get notified on the status of your article submissions in real time?',
    [NotificationPromptSource.NotificationsPage]:
      'Stay in the loop whenever you get a mention, reply and other important updates.',
  };
  const message = sourceToMessage[source];
  const classes = containerClassName[source];

  return (
    <div
      className={classNames(
        'overflow-hidden relative py-4 typo-callout border-theme-color-cabbage',
        classes,
      )}
    >
      {source === NotificationPromptSource.NotificationsPage && (
        <span className="flex flex-row font-bold">
          {isEnabled && <VIcon className="mr-2" />}
          {`Push notifications${isEnabled ? ' successfully enabled' : ''}`}
        </span>
      )}
      <p className="mt-2 w-full tablet:w-3/5 text-theme-label-tertiary">
        {isEnabled ? (
          <>
            Changing your{' '}
            <a
              className="underline hover:no-underline"
              href={`${webappUrl}account/notifications`}
            >
              notification settings
            </a>{' '}
            can be done anytime through your account details
          </>
        ) : (
          message
        )}
      </p>
      {!hasEnabled && (
        <Button
          buttonSize="small"
          className="mt-4 text-white min-w-[7rem] btn-primary-cabbage"
          onClick={onEnable}
        >
          Enable Notifications
        </Button>
      )}
      <img
        className={classNames(
          'hidden tablet:flex absolute right-4 w-[7.5rem]',
          isEnabled ? '-bottom-8' : '-bottom-2',
        )}
        src={
          isEnabled
            ? cloudinary.notifications.browser_enabled
            : cloudinary.notifications.browser
        }
        alt="A sample browser notification"
      />
      <CloseButton
        buttonSize="xsmall"
        className="top-1 laptop:top-3 right-1 laptop:right-3"
        onClick={onDismiss}
        position="absolute"
      />
    </div>
  );
}

export default EnableNotification;
