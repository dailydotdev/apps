import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import CloseButton from '../CloseButton';
import { cloudinary } from '../../lib/image';
import { VIcon, BellNotifyIcon } from '../icons';
import { webappUrl } from '../../lib/constants';
import { NotificationPromptSource } from '../../lib/log';
import { useEnableNotification } from '../../hooks/notifications';

type EnableNotificationProps = {
  source?: NotificationPromptSource;
  contentName?: string;
  className?: string;
  label?: string;
};

const containerClassName: Record<NotificationPromptSource, string> = {
  [NotificationPromptSource.NotificationsPage]:
    'px-6 w-full border-l bg-surface-float',
  [NotificationPromptSource.NewComment]: 'rounded-16 border px-4 mx-3 mb-3',
  [NotificationPromptSource.CommunityPicks]: 'rounded-16 border px-4 mt-3',
  [NotificationPromptSource.NewSourceModal]: '',
  [NotificationPromptSource.NotificationItem]: '',
  [NotificationPromptSource.SquadPage]: 'rounded-16 border px-4 mt-6',
  [NotificationPromptSource.SquadPostCommentary]: '',
  [NotificationPromptSource.SquadPostModal]:
    'laptop:rounded-16 laptop:rounded-bl-[0] laptop:rounded-br-[0]',
  [NotificationPromptSource.SquadChecklist]: '',
  [NotificationPromptSource.SourceSubscribe]: 'w-full px-3 !pt-0 !pb-2',
  [NotificationPromptSource.ReadingReminder]: '',
  [NotificationPromptSource.BookmarkReminder]: '',
};

const sourceRenderTextCloseButton: Record<NotificationPromptSource, boolean> = {
  [NotificationPromptSource.NotificationsPage]: false,
  [NotificationPromptSource.NewComment]: false,
  [NotificationPromptSource.CommunityPicks]: false,
  [NotificationPromptSource.NewSourceModal]: false,
  [NotificationPromptSource.SquadPage]: true,
  [NotificationPromptSource.SquadPostCommentary]: false,
  [NotificationPromptSource.SquadPostModal]: false,
  [NotificationPromptSource.NotificationItem]: false,
  [NotificationPromptSource.SquadChecklist]: false,
  [NotificationPromptSource.SourceSubscribe]: true,
  [NotificationPromptSource.ReadingReminder]: false,
  [NotificationPromptSource.BookmarkReminder]: false,
};

const sourceToButtonText: Partial<Record<NotificationPromptSource, string>> = {
  [NotificationPromptSource.SquadPostModal]: 'Subscribe',
  [NotificationPromptSource.SourceSubscribe]: 'Enable',
};

function EnableNotification({
  source = NotificationPromptSource.NotificationsPage,
  contentName,
  className,
  label,
}: EnableNotificationProps): ReactElement {
  const { shouldShowCta, acceptedJustNow, onEnable, onDismiss } =
    useEnableNotification({ source });

  if (!shouldShowCta) {
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
    [NotificationPromptSource.NotificationItem]: '',
    [NotificationPromptSource.SquadPostCommentary]: '',
    [NotificationPromptSource.SquadPage]: `Get notified whenever something important happens on ${contentName}.`,
    [NotificationPromptSource.SquadChecklist]: '',
    [NotificationPromptSource.SourceSubscribe]: `Get notified whenever there are new posts from ${contentName}.`,
    [NotificationPromptSource.ReadingReminder]: '',
    [NotificationPromptSource.BookmarkReminder]: '',
  };
  const message = sourceToMessage[source];
  const classes = containerClassName[source];
  const showTextCloseButton = sourceRenderTextCloseButton[source];
  const buttonText = sourceToButtonText[source] ?? 'Enable notifications';

  if (source === NotificationPromptSource.SquadPostModal) {
    return (
      <span
        className={classNames(
          'relative flex w-full flex-row items-center bg-gradient-to-r from-accent-water-default to-accent-onion-default p-3 font-bold typo-body',
          containerClassName[source],
        )}
      >
        <BellNotifyIcon secondary className="mr-2" /> Never miss new posts from{' '}
        {label}
        <Button
          className="ml-auto mr-14"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.XSmall}
          onClick={onEnable}
        >
          {buttonText}
        </Button>
        <CloseButton className="absolute right-3" onClick={onDismiss} />
      </span>
    );
  }

  return (
    <div
      className={classNames(
        'relative overflow-hidden border-accent-cabbage-default py-4 typo-callout',
        classes,
        className,
      )}
    >
      {source === NotificationPromptSource.NotificationsPage && (
        <span className="flex flex-row font-bold">
          {acceptedJustNow && <VIcon className="mr-2" />}
          {`Push notifications${
            acceptedJustNow ? ' successfully enabled' : ''
          }`}
        </span>
      )}
      <div className="mt-2 flex justify-between gap-2">
        <p
          className={classNames(
            'w-full text-text-tertiary tablet:w-3/5',
            source === NotificationPromptSource.SourceSubscribe && 'flex-1',
          )}
        >
          {acceptedJustNow ? (
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
        <img
          className={classNames(
            source === NotificationPromptSource.SourceSubscribe
              ? 'h-16 w-auto'
              : 'absolute -bottom-2 hidden w-[7.5rem] tablet:flex',
            acceptedJustNow ? 'right-14' : 'right-4',
          )}
          src={
            acceptedJustNow
              ? cloudinary.notifications.browser_enabled
              : cloudinary.notifications.browser
          }
          alt="A sample browser notification"
        />
      </div>
      <div className="align-center mt-4 flex">
        {!acceptedJustNow && (
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            className="mr-4"
            onClick={onEnable}
          >
            {buttonText}
          </Button>
        )}
        {showTextCloseButton && (
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        )}
      </div>
      {!showTextCloseButton && (
        <CloseButton
          size={ButtonSize.XSmall}
          className="absolute right-1 top-1 laptop:right-3 laptop:top-3"
          onClick={onDismiss}
        />
      )}
    </div>
  );
}

export default EnableNotification;
