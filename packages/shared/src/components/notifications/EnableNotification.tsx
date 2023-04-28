import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import usePersistentContext from '../../hooks/usePersistentContext';
import { Button, ButtonSize } from '../buttons/Button';
import NotificationsContext from '../../contexts/NotificationsContext';
import CloseButton from '../CloseButton';
import { cloudinary } from '../../lib/image';
import VIcon from '../icons/V';
import { webappUrl } from '../../lib/constants';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import {
  AnalyticsEvent,
  NotificationPromptSource,
  TargetType,
} from '../../lib/analytics';
import BellNotifyIcon from '../icons/Bell/Notify';

export const DISMISS_PERMISSION_BANNER = 'DISMISS_PERMISSION_BANNER';

type EnableNotificationProps = {
  source?: NotificationPromptSource;
  contentName?: string;
  className?: string;
  label?: string;
};

const containerClassName: Record<NotificationPromptSource, string> = {
  [NotificationPromptSource.NotificationsPage]:
    'px-6 w-full border-l bg-theme-float',
  [NotificationPromptSource.NewComment]: 'rounded-16 border px-4 mx-3 mb-3',
  [NotificationPromptSource.CommunityPicks]: 'rounded-16 border px-4 mt-3',
  [NotificationPromptSource.NewSourceModal]: '',
  [NotificationPromptSource.SquadPage]: 'rounded-16 border px-4 mt-6',
  [NotificationPromptSource.SquadPostModal]:
    'laptop:rounded-16 laptop:rounded-bl-[0] laptop:rounded-br-[0]',
};

const sourceRenderTextCloseButton: Record<NotificationPromptSource, boolean> = {
  [NotificationPromptSource.NotificationsPage]: false,
  [NotificationPromptSource.NewComment]: false,
  [NotificationPromptSource.CommunityPicks]: false,
  [NotificationPromptSource.NewSourceModal]: false,
  [NotificationPromptSource.SquadPage]: true,
  [NotificationPromptSource.SquadPostModal]: false,
};

function EnableNotification({
  source = NotificationPromptSource.NotificationsPage,
  contentName,
  className,
  label,
}: EnableNotificationProps): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const {
    isInitialized,
    isSubscribed,
    isNotificationSupported,
    hasPermissionCache,
    acceptedPermissionJustNow: isEnabled,
    onAcceptedPermissionJustNow,
    onTogglePermission,
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
    const permission = await onTogglePermission(source);

    if (permission === null) {
      return;
    }

    const isGranted = permission === 'granted';

    onAcceptedPermissionJustNow?.(isGranted);
  };

  const hasEnabled = (isSubscribed || hasPermissionCache) && isEnabled;

  const conditions = [
    !isLoaded,
    isDismissed,
    !isInitialized,
    !isNotificationSupported,
    (isSubscribed || hasPermissionCache) && !isEnabled,
    hasEnabled && source === NotificationPromptSource.SquadPostModal,
  ];
  const shouldNotDisplay = conditions.some((passed) => passed);

  useEffect(() => {
    if (shouldNotDisplay) {
      return;
    }

    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.EnableNotifications,
      extra: JSON.stringify({ origin: source }),
    });
  }, [shouldNotDisplay]);

  useEffect(() => {
    return () => {
      onAcceptedPermissionJustNow?.(false);
    };
  }, []);

  if (shouldNotDisplay) {
    return null;
  }

  const sourceToMessage: Record<NotificationPromptSource, string> = {
    [NotificationPromptSource.SquadPostModal]: '',
    [NotificationPromptSource.NewComment]: `Want to get notified when ${
      contentName ?? 'someone'
    } responds so you can continue the conversation?`,
    [NotificationPromptSource.CommunityPicks]:
      'Would you like to get notified on the status of your post submissions in real time?',
    [NotificationPromptSource.NotificationsPage]:
      'Stay in the loop whenever you get a mention, reply and other important updates.',
    [NotificationPromptSource.NewSourceModal]: '',
    [NotificationPromptSource.SquadPage]: `Get notified whenever something important happens on ${contentName}.`,
  };
  const message = sourceToMessage[source];
  const classes = containerClassName[source];
  const showTextCloseButton = sourceRenderTextCloseButton[source];

  if (source === NotificationPromptSource.SquadPostModal)
    return (
      <span
        className={classNames(
          'flex relative flex-row items-center p-3 w-full font-bold bg-gradient-to-r from-theme-color-water to-theme-color-onion typo-body',
          containerClassName[source],
        )}
      >
        <BellNotifyIcon secondary className="mr-2" /> Never miss new posts from{' '}
        {label}
        <Button
          className="mr-14 ml-auto btn-secondary"
          buttonSize={ButtonSize.XSmall}
          onClick={onEnable}
        >
          Subscribe
        </Button>
        <CloseButton
          className="right-3"
          position="absolute"
          onClick={onDismiss}
        />
      </span>
    );

  return (
    <div
      className={classNames(
        'overflow-hidden relative py-4 typo-callout border-theme-color-cabbage',
        classes,
        className,
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
      <div className="flex mt-4 align-center">
        {!hasEnabled && (
          <Button
            buttonSize={ButtonSize.Small}
            className="mr-4 min-w-[7rem] btn-primary-cabbage"
            onClick={onEnable}
          >
            Enable notifications
          </Button>
        )}
        {showTextCloseButton && (
          <Button
            buttonSize={ButtonSize.Small}
            className="btn-tertiary"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        )}
      </div>
      <img
        className={classNames(
          'hidden tablet:flex absolute w-[7.5rem] -bottom-2',
          isEnabled ? 'right-14' : 'right-4',
        )}
        src={
          isEnabled
            ? cloudinary.notifications.browser_enabled
            : cloudinary.notifications.browser
        }
        alt="A sample browser notification"
      />
      {!showTextCloseButton && (
        <CloseButton
          buttonSize={ButtonSize.XSmall}
          className="top-1 laptop:top-3 right-1 laptop:right-3"
          onClick={onDismiss}
          position="absolute"
        />
      )}
    </div>
  );
}

export default EnableNotification;
