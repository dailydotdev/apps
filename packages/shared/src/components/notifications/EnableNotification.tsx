import React, { ReactElement, useContext } from 'react';
import usePersistentContext from '../../hooks/usePersistentContext';
import { Button } from '../buttons/Button';
import NotificationsContext from '../../contexts/NotificationsContext';
import { cloudinary } from '../../lib/image';
import CloseButton from '../CloseButton';

export enum NotificationPromptSource {
  NotificationList = 'notificationList',
  NewComment = 'newComment',
  NewSource = 'newSource',
}

const DISMISS_BROWSER_PERMISSION = 'dismissBrowserPermission';

type DismissBrowserPermissions = {
  [NotificationPromptSource.NotificationList]: boolean;
  [NotificationPromptSource.NewComment]: boolean;
  [NotificationPromptSource.NewSource]: boolean;
};

const DEFAULT_CACHE_VALUE: DismissBrowserPermissions = {
  newComment: false,
  newSource: false,
  notificationList: false,
};

type EnableNotificationProps = {
  source?: NotificationPromptSource;
  parentCommentAuthorName?: string;
};

function EnableNotification({
  source = NotificationPromptSource.NotificationList,
  parentCommentAuthorName,
}: EnableNotificationProps): ReactElement {
  const { hasPermission, requestPermission } = useContext(NotificationsContext);
  const [dismissedCache, setDismissedCache, isLoaded] =
    usePersistentContext<DismissBrowserPermissions>(
      DISMISS_BROWSER_PERMISSION,
      DEFAULT_CACHE_VALUE,
    );
  const dismissed = !!dismissedCache?.[source];
  const setDismissed = (value: boolean) =>
    setDismissedCache({ ...dismissedCache, [source]: value });
  if (!isLoaded || dismissed || hasPermission) {
    return null;
  }
  if (source === NotificationPromptSource.NotificationList) {
    return (
      <div className="relative py-4 px-6 w-full bg-theme-float border-l typo-callout border-theme-color-cabbage">
        <span className="mb-2 font-bold">Push notifications</span>
        <p className="w-3/5 text-theme-label-tertiary">
          Stay in the loop whenever you get a mention, reply and other important
          updates.
        </p>
        <span className="flex flex-row gap-4 mt-4">
          <Button
            buttonSize="small"
            className="w-28 text-white btn-primary-cabbage"
            onClick={requestPermission}
          >
            Enable
          </Button>
          <Button
            buttonSize="small"
            className="w-28 btn-tertiary"
            onClick={() => setDismissed(true)}
          >
            Dismiss
          </Button>
        </span>
        <img
          className="absolute top-2 right-0"
          src={cloudinary.notifications.browser}
          alt="A sample browser notification"
        />
      </div>
    );
  }
  const message =
    source === NotificationPromptSource.NewSource
      ? 'Would you like to get notified on the status of your article submissions in real time?'
      : `Want to get notified when ${
          parentCommentAuthorName ?? 'someone'
        } responds so you can continue the conversation?`;
  return (
    <div className="overflow-hidden relative py-4 px-4 mt-3 rounded-16 border typo-callout border-theme-color-cabbage">
      <p className="w-3/5 text-theme-label-tertiary">{message}</p>
      <span className="flex flex-row gap-4 mt-4">
        <Button
          buttonSize="small"
          className="text-white btn-primary-cabbage"
          onClick={requestPermission}
        >
          Enable Notifications
        </Button>
      </span>
      <img
        className="absolute right-4 -bottom-2"
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
