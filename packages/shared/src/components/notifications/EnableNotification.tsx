import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
import {
  cloudinaryNotificationsBrowserEnabled,
  cloudinaryNotificationsBrowser,
} from '../../lib/image';
import { VIcon, BellIcon, BellNotifyIcon } from '../icons';
import { webappUrl } from '../../lib/constants';
import { NotificationPromptSource } from '../../lib/log';
import { useEnableNotification } from '../../hooks/notifications';
import { NotificationSvg } from './NotificationSvg';

type EnableNotificationProps = {
  source?: NotificationPromptSource;
  contentName?: string;
  className?: string;
  label?: string;
  onEnableAction?: () => Promise<unknown> | unknown;
  ignoreDismissState?: boolean;
};

const containerClassName: Record<NotificationPromptSource, string> = {
  [NotificationPromptSource.NotificationsPage]: 'px-6 w-full bg-surface-float',
  [NotificationPromptSource.NewComment]:
    'rounded-16 px-4 w-full bg-surface-float',
  [NotificationPromptSource.CommentUpvote]:
    'ml-[3.25rem] w-[calc(100%-3.25rem)] rounded-16 px-4 bg-surface-float',
  [NotificationPromptSource.PostTagFollow]:
    'rounded-16 px-4 w-full bg-surface-float',
  [NotificationPromptSource.NewSourceModal]: '',
  [NotificationPromptSource.NotificationItem]: '',
  [NotificationPromptSource.SquadPage]: 'rounded-16 border px-4 mt-6',
  [NotificationPromptSource.SquadPostCommentary]: '',
  [NotificationPromptSource.SquadPostModal]: '',
  [NotificationPromptSource.SquadChecklist]: '',
  [NotificationPromptSource.SourceSubscribe]: 'w-full px-3 !pt-0 !pb-2',
  [NotificationPromptSource.ReadingReminder]: '',
  [NotificationPromptSource.BookmarkReminder]: '',
};

const sourceRenderTextCloseButton: Record<NotificationPromptSource, boolean> = {
  [NotificationPromptSource.NotificationsPage]: false,
  [NotificationPromptSource.NewComment]: false,
  [NotificationPromptSource.CommentUpvote]: false,
  [NotificationPromptSource.PostTagFollow]: false,
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
  [NotificationPromptSource.NewComment]: 'Notify me',
  [NotificationPromptSource.CommentUpvote]: 'Turn on',
};

function EnableNotification({
  source = NotificationPromptSource.NotificationsPage,
  contentName,
  className,
  label,
  onEnableAction,
  ignoreDismissState = false,
}: EnableNotificationProps): ReactElement | null {
  const { shouldShowCta, acceptedJustNow, onEnable, onDismiss } =
    useEnableNotification({ source, ignoreDismissState });

  if (!shouldShowCta) {
    return null;
  }

  const sourceToMessage: Record<NotificationPromptSource, string> = {
    [NotificationPromptSource.SquadPostModal]: '',
    [NotificationPromptSource.NewComment]:
      'Someone might reply soon. Don’t miss it.',
    [NotificationPromptSource.CommentUpvote]:
      'Get notified when someone replies to this comment.',
    [NotificationPromptSource.PostTagFollow]: `Get notified when new #${contentName} stories are posted.`,
    [NotificationPromptSource.NotificationsPage]:
      'Get notified when someone replies to your posts, mentions you, or when discussions you follow get new activity.',
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
  const hideCloseButton =
    source === NotificationPromptSource.NewComment ||
    source === NotificationPromptSource.CommentUpvote ||
    source === NotificationPromptSource.PostTagFollow;
  const buttonText = sourceToButtonText[source] ?? 'Enable notifications';
  const shouldShowNotificationArtwork =
    source === NotificationPromptSource.NotificationsPage;
  const shouldAnimateBellCta =
    source === NotificationPromptSource.NotificationsPage ||
    source === NotificationPromptSource.NewComment ||
    source === NotificationPromptSource.CommentUpvote ||
    source === NotificationPromptSource.PostTagFollow;
  const shouldShowInlineNotificationImage =
    source !== NotificationPromptSource.NotificationsPage &&
    source !== NotificationPromptSource.NewComment &&
    source !== NotificationPromptSource.CommentUpvote &&
    source !== NotificationPromptSource.PostTagFollow;
  const shouldInlineActionWithMessage =
    (source === NotificationPromptSource.NewComment ||
      source === NotificationPromptSource.CommentUpvote ||
      source === NotificationPromptSource.PostTagFollow) &&
    !acceptedJustNow;
  const shouldUseVerticalContentLayout =
    source === NotificationPromptSource.NotificationsPage;
  const handleEnable = async () => {
    const actions = [onEnable()];

    if (onEnableAction) {
      actions.push(Promise.resolve(onEnableAction()));
    }

    await Promise.allSettled(actions);
  };
  const notificationVisual = (() => {
    if (shouldShowNotificationArtwork) {
      return (
        <div className="hidden h-16 w-32 shrink-0 overflow-hidden tablet:block">
          {acceptedJustNow ? (
            <img
              src={cloudinaryNotificationsBrowserEnabled}
              alt="A sample browser notification"
            />
          ) : (
            <NotificationSvg />
          )}
        </div>
      );
    }

    if (!shouldShowInlineNotificationImage) {
      return null;
    }

    return (
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
    );
  })();

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
          onClick={handleEnable}
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
        (source === NotificationPromptSource.NewComment ||
          source === NotificationPromptSource.CommentUpvote ||
          source === NotificationPromptSource.PostTagFollow) &&
          'flex',
        classes,
        className,
      )}
    >
      <div
        className={classNames(
          'flex gap-4',
          shouldUseVerticalContentLayout ? 'justify-start' : 'justify-between',
          source === NotificationPromptSource.NewComment ||
            source === NotificationPromptSource.CommentUpvote ||
            source === NotificationPromptSource.PostTagFollow
            ? 'mt-0 w-full'
            : 'mt-2',
          shouldUseVerticalContentLayout && 'items-center',
          (source === NotificationPromptSource.NewComment ||
            source === NotificationPromptSource.CommentUpvote ||
            source === NotificationPromptSource.PostTagFollow) &&
            'items-center',
        )}
      >
        <div
          className={classNames(
            'min-w-0 flex flex-1',
            shouldInlineActionWithMessage
              ? 'items-center gap-2'
              : 'flex-col gap-3',
          )}
        >
          {source === NotificationPromptSource.NotificationsPage && (
            <h2 className="flex flex-row font-bold typo-body">
              {acceptedJustNow && <VIcon className="mr-2" />}
              Stay in the dev loop
            </h2>
          )}
          <p
            className={classNames(
              'min-w-0 flex-1 text-text-tertiary',
              (source === NotificationPromptSource.NewComment ||
                source === NotificationPromptSource.PostTagFollow) &&
                'text-primary break-words typo-markdown tablet:w-full',
              source === NotificationPromptSource.CommentUpvote &&
                'text-primary break-words typo-callout tablet:w-full',
              shouldInlineActionWithMessage && 'flex-1',
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
          {shouldInlineActionWithMessage && (
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              className="shrink-0"
              icon={
                shouldAnimateBellCta ? (
                  <BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_infinite]" />
                ) : undefined
              }
              onClick={handleEnable}
            >
              {buttonText}
            </Button>
          )}
          {shouldUseVerticalContentLayout &&
            !acceptedJustNow &&
            !shouldInlineActionWithMessage && (
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                className="w-fit"
                icon={
                  shouldAnimateBellCta ? (
                    <BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_infinite]" />
                  ) : undefined
                }
                onClick={handleEnable}
              >
                {buttonText}
              </Button>
            )}
        </div>
        {notificationVisual}
      </div>
      <div
        className={classNames(
          'align-center flex',
          source === NotificationPromptSource.NewComment ||
            source === NotificationPromptSource.CommentUpvote ||
            source === NotificationPromptSource.PostTagFollow
            ? 'mt-3'
            : 'mt-4',
          (source === NotificationPromptSource.NewComment ||
            source === NotificationPromptSource.CommentUpvote ||
            source === NotificationPromptSource.PostTagFollow) &&
            'justify-end',
        )}
      >
        {!acceptedJustNow &&
          !shouldInlineActionWithMessage &&
          !shouldUseVerticalContentLayout && (
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              className={classNames(
                source !== NotificationPromptSource.NewComment &&
                  source !== NotificationPromptSource.CommentUpvote &&
                  source !== NotificationPromptSource.PostTagFollow &&
                  'mr-4',
              )}
              icon={
                shouldAnimateBellCta ? (
                  <BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_infinite]" />
                ) : undefined
              }
              onClick={handleEnable}
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
      {!showTextCloseButton && !hideCloseButton && (
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
