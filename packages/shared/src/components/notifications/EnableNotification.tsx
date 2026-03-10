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
};

const containerClassName: Record<NotificationPromptSource, string> = {
  [NotificationPromptSource.NotificationsPage]:
    'px-6 w-full bg-surface-float',
  [NotificationPromptSource.NewComment]: 'rounded-16 px-4 w-full bg-surface-float',
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
}: EnableNotificationProps): ReactElement | null {
  const { shouldShowCta, acceptedJustNow, onEnable, onDismiss } =
    useEnableNotification({ source });

  if (!shouldShowCta) {
    return null;
  }

  const sourceToMessage: Record<NotificationPromptSource, string> = {
    [NotificationPromptSource.SquadPostModal]: '',
    [NotificationPromptSource.NewComment]:
      'Someone might reply soon. Don’t miss it.',
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
  const hideCloseButton = source === NotificationPromptSource.NewComment;
  const buttonText = sourceToButtonText[source] ?? 'Enable notifications';
  const shouldUseNotificationsPageUi =
    source === NotificationPromptSource.NotificationsPage ||
    source === NotificationPromptSource.NewComment;
  const shouldShowNotificationArtwork =
    source === NotificationPromptSource.NotificationsPage;
  const shouldAnimateBellCta =
    source === NotificationPromptSource.NotificationsPage ||
    source === NotificationPromptSource.NewComment;
  const shouldShowInlineNotificationImage =
    source !== NotificationPromptSource.NotificationsPage &&
    source !== NotificationPromptSource.NewComment;
  const shouldInlineActionWithMessage =
    source === NotificationPromptSource.NewComment && !acceptedJustNow;

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
        source === NotificationPromptSource.NewComment && 'flex',
        classes,
        className,
      )}
    >
      {shouldAnimateBellCta && (
        <style>
          {`
            @keyframes enable-notification-bell-ring {
              0%, 100% { transform: rotate(0deg); }
              20% { transform: rotate(-16deg); }
              40% { transform: rotate(14deg); }
              60% { transform: rotate(-10deg); }
              80% { transform: rotate(8deg); }
            }
          `}
        </style>
      )}
      {source === NotificationPromptSource.NotificationsPage && (
        <h2 className="flex flex-row font-bold typo-body">
          {acceptedJustNow && <VIcon className="mr-2" />}
          Stay in the dev loop
        </h2>
      )}
      <div
        className={classNames(
          'flex justify-between gap-2',
          source === NotificationPromptSource.NewComment ? 'mt-0 w-full' : 'mt-2',
          source === NotificationPromptSource.NewComment && 'items-center',
        )}
      >
        <p
          className={classNames(
            'w-full text-text-tertiary tablet:w-3/5',
            source === NotificationPromptSource.SourceSubscribe && 'flex-1',
            source === NotificationPromptSource.NewComment && 'tablet:w-full',
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
            color={ButtonColor.Cabbage}
            className="shrink-0"
            icon={
              shouldAnimateBellCta ? (
                <BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_infinite]" />
              ) : undefined
            }
            onClick={onEnable}
          >
            {buttonText}
          </Button>
        )}
        {shouldShowNotificationArtwork ? (
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
        ) : shouldShowInlineNotificationImage ? (
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
        ) : null}
      </div>
      <div
        className={classNames(
          'align-center flex',
          source === NotificationPromptSource.NewComment ? 'mt-3' : 'mt-4',
          source === NotificationPromptSource.NewComment && 'justify-end',
        )}
      >
        {!acceptedJustNow &&
          !shouldInlineActionWithMessage && (
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            className={classNames(
              source !== NotificationPromptSource.NewComment && 'mr-4',
            )}
            icon={
              shouldAnimateBellCta ? (
                <BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_infinite]" />
              ) : undefined
            }
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
