import React, { ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import usePersistentContext from '../../hooks/usePersistentContext';
import { Button } from '../buttons/Button';
import NotificationsContext from '../../contexts/NotificationsContext';
import CloseButton from '../CloseButton';
import { cloudinary } from '../../lib/image';
import VIcon from '../icons/V';
import { webappUrl } from '../../lib/constants';

export enum NotificationPromptSource {
  NotificationList = 'notificationList',
  NewComment = 'newComment',
  NewSource = 'newSource',
}

const DISMISS_BROWSER_PERMISSION = 'dismissBrowserPermission';

type DismissBrowserPermissions = Record<NotificationPromptSource, boolean>;

const DEFAULT_CACHE_VALUE: DismissBrowserPermissions = {
  newComment: false,
  newSource: false,
  notificationList: false,
};

type EnableNotificationProps = {
  source?: NotificationPromptSource;
  parentCommentAuthorName?: string;
};

const containerClassName: Record<NotificationPromptSource, string> = {
  notificationList: 'px-6 w-full border-l',
  newComment: 'border px-4 mt-3',
  newSource: 'border px-4 mt-3',
};

function EnableNotification({
  source = NotificationPromptSource.NotificationList,
  parentCommentAuthorName,
}: EnableNotificationProps): ReactElement {
  const [isEnabled, setIsEnabled] = useState(false);
  const { hasPermission, notificationsAvailable, requestPermission } =
    useContext(NotificationsContext);
  const [dismissedCache, setDismissedCache, isLoaded] =
    usePersistentContext<DismissBrowserPermissions>(
      DISMISS_BROWSER_PERMISSION,
      DEFAULT_CACHE_VALUE,
    );
  const dismissed = !!dismissedCache?.[source];
  const setDismissed = (value: boolean) =>
    setDismissedCache({ ...dismissedCache, [source]: value });

  const onEnable = async () => {
    const permission = await requestPermission();

    setIsEnabled(permission === 'granted');
  };

  if (
    !isLoaded ||
    dismissed ||
    !notificationsAvailable() ||
    (hasPermission && !isEnabled)
  ) {
    return null;
  }

  const sourceToMessage: Record<NotificationPromptSource, string> = {
    [NotificationPromptSource.NewComment]: `Want to get notified when ${
      parentCommentAuthorName ?? 'someone'
    } responds so you can continue the conversation?`,
    [NotificationPromptSource.NewSource]:
      'Would you like to get notified on the status of your article submissions in real time?',
    [NotificationPromptSource.NotificationList]:
      'Stay in the loop whenever you get a mention, reply and other important updates.',
  };
  const message = sourceToMessage[source];
  const classes = containerClassName[source];

  return (
    <div
      className={classNames(
        'overflow-hidden relative py-4 rounded-16 typo-callout border-theme-color-cabbage',
        classes,
      )}
    >
      {source === NotificationPromptSource.NotificationList && (
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
      <span className="flex flex-row gap-4 mt-4">
        <Button
          buttonSize="small"
          className="text-white min-w-[7rem] btn-primary-cabbage"
          onClick={onEnable}
        >
          Enable Notifications
        </Button>
      </span>
      <img
        className="hidden tablet:flex absolute right-4 -bottom-2"
        src={cloudinary.notifications.browser}
        alt="A sample browser notification"
      />
      <CloseButton
        buttonSize="xsmall"
        className="top-3 right-3"
        onClick={() => setDismissed(true)}
        position="absolute"
      />
    </div>
  );
}

export default EnableNotification;
