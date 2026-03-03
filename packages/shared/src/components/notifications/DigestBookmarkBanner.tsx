import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import CloseButton from '../CloseButton';
import { MailIcon } from '../icons';
import { LogEvent, TargetId } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import {
  usePersonalizedDigest,
  SendType,
} from '../../hooks/usePersonalizedDigest';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';
import { NotificationType } from './utils';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import { useToastNotification } from '../../hooks/useToastNotification';

export function DigestBookmarkBanner(): ReactElement | null {
  const { logEvent } = useLogContext();
  const { isAuthReady } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { getPersonalizedDigest, subscribePersonalizedDigest } =
    usePersonalizedDigest();
  const hasDigest = !!getPersonalizedDigest(UserPersonalizedDigestType.Digest);
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const { setNotificationStatusBulk } = useNotificationSettings();
  const { displayToast } = useToastNotification();
  const dismissed = checkHasCompleted(ActionType.DigestUpsell);
  const impressionLogged = useRef(false);

  const showBanner =
    isAuthReady && !isPlus && !hasDigest && !dismissed && isActionsFetched;

  useEffect(() => {
    if (showBanner && !impressionLogged.current) {
      impressionLogged.current = true;
      logEvent({
        event_name: LogEvent.Impression,
        target_id: TargetId.DigestUpsellBookmarks,
      });
    }
  }, [showBanner, logEvent]);

  if (!showBanner) {
    return null;
  }

  const onEnable = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: TargetId.DigestUpsellBookmarks,
    });

    await subscribePersonalizedDigest({
      hour: 9,
      sendType: SendType.Workdays,
      type: UserPersonalizedDigestType.Digest,
    });

    setNotificationStatusBulk([
      {
        type: NotificationType.BriefingReady,
        channel: 'email',
        status: NotificationPreferenceStatus.Subscribed,
      },
      {
        type: NotificationType.DigestReady,
        channel: 'inApp',
        status: NotificationPreferenceStatus.Subscribed,
      },
    ]);

    await completeAction(ActionType.DigestUpsell);

    displayToast('Digest enabled! Check your inbox tomorrow.');
  };

  const onDismiss = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: TargetId.DigestUpsellBookmarks,
      extra: JSON.stringify({ action: 'dismiss' }),
    });
    completeAction(ActionType.DigestUpsell);
  };

  return (
    <div className="relative mx-4 mb-4 overflow-hidden rounded-16 border border-accent-cabbage-default bg-surface-float px-6 py-4 typo-callout laptop:mx-auto laptop:max-w-[40rem]">
      <span className="flex flex-row items-center font-bold">
        <MailIcon className="mr-2" />
        Not sure what to read? Let us pick for you
      </span>
      <p className="mt-2 text-text-tertiary">
        Get a daily digest with the best posts from your favorite topics,
        straight to your inbox.
      </p>
      <div className="mt-3 flex items-center">
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          onClick={onEnable}
        >
          Enable digest
        </Button>
      </div>
      <CloseButton
        size={ButtonSize.XSmall}
        className="absolute right-1 top-1 laptop:right-3 laptop:top-3"
        onClick={onDismiss}
      />
    </div>
  );
}
