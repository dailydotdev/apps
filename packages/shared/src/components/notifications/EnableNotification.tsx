import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import CloseButton from '../CloseButton';
import {
  cloudinaryNotificationsBrowserEnabled,
  cloudinaryNotificationsBrowser,
} from '../../lib/image';
import { VIcon } from '../icons';
import { webappUrl } from '../../lib/constants';
import { NotificationPromptSource } from '../../lib/log';
import type { NotificationCtaPlacement } from '../../lib/log';
import { useEnableNotification } from '../../hooks/notifications';

type EnableNotificationProps = {
  source?: NotificationPromptSource;
  placement?: NotificationCtaPlacement;
  contentName?: string;
  className?: string;
  onEnableAction?: () => Promise<unknown> | unknown;
};

const containerClassName: Partial<Record<NotificationPromptSource, string>> = {
  [NotificationPromptSource.NotificationsPage]: 'px-6 w-full bg-surface-float',
  [NotificationPromptSource.NewSourceModal]: '',
  [NotificationPromptSource.NotificationItem]: '',
  [NotificationPromptSource.SquadPostCommentary]: '',
  [NotificationPromptSource.SquadChecklist]: '',
  [NotificationPromptSource.SourceSubscribe]: 'w-full px-3 !pt-0 !pb-2',
  [NotificationPromptSource.ReadingReminder]: '',
  [NotificationPromptSource.BookmarkReminder]: '',
};

const sourceRenderTextCloseButton: Partial<
  Record<NotificationPromptSource, boolean>
> = {
  [NotificationPromptSource.NotificationsPage]: false,
  [NotificationPromptSource.NewSourceModal]: false,
  [NotificationPromptSource.SquadPostCommentary]: false,
  [NotificationPromptSource.NotificationItem]: false,
  [NotificationPromptSource.SquadChecklist]: false,
  [NotificationPromptSource.SourceSubscribe]: true,
  [NotificationPromptSource.ReadingReminder]: false,
  [NotificationPromptSource.BookmarkReminder]: false,
};

const sourceToButtonText: Partial<Record<NotificationPromptSource, string>> = {
  [NotificationPromptSource.SourceSubscribe]: 'Enable',
};

function EnableNotification({
  source = NotificationPromptSource.NotificationsPage,
  placement,
  contentName,
  className,
  onEnableAction,
}: EnableNotificationProps): ReactElement | null {
  const { shouldShowCta, acceptedJustNow, onEnable, onDismiss } =
    useEnableNotification({
      source,
      placement,
      onEnableAction,
    });

  if (!shouldShowCta) {
    return null;
  }

  const sourceToMessage: Partial<Record<NotificationPromptSource, string>> = {
    [NotificationPromptSource.NotificationsPage]:
      'Stay in the loop whenever you get a mention, reply and other important updates.',
    [NotificationPromptSource.NewSourceModal]: '',
    [NotificationPromptSource.NotificationItem]: '',
    [NotificationPromptSource.SquadPostCommentary]: '',
    [NotificationPromptSource.SquadChecklist]: '',
    [NotificationPromptSource.SourceSubscribe]: `Get notified whenever there are new posts from ${contentName}.`,
    [NotificationPromptSource.ReadingReminder]: '',
    [NotificationPromptSource.BookmarkReminder]:
      'Get a push reminder right on time, even when you leave the app.',
  };
  const message = sourceToMessage[source] ?? '';
  const classes = containerClassName[source] ?? '';
  const showTextCloseButton = sourceRenderTextCloseButton[source] ?? false;
  const buttonText = sourceToButtonText[source] ?? 'Enable notifications';
  const shouldUseTopRightCloseButton =
    source === NotificationPromptSource.NotificationsPage;

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
              ? cloudinaryNotificationsBrowserEnabled
              : cloudinaryNotificationsBrowser
          }
          alt="A sample browser notification"
        />
      </div>
      <div className="mt-4 flex items-center justify-start">
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
        {!showTextCloseButton && !shouldUseTopRightCloseButton && (
          <CloseButton size={ButtonSize.XSmall} onClick={onDismiss} />
        )}
      </div>
      {shouldUseTopRightCloseButton && (
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
