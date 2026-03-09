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

export function DigestUpsellBanner(): ReactElement | null {
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
        target_id: TargetId.DigestUpsell,
      });
    }
  }, [showBanner, logEvent]);

  if (!showBanner) {
    return null;
  }

  const onEnable = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: TargetId.DigestUpsell,
    });

    try {
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
    } catch {
      displayToast('Failed to enable digest. Please try again in settings.');
    }
  };

  const onDismiss = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: TargetId.DigestUpsell,
      extra: JSON.stringify({ action: 'dismiss' }),
    });
    await completeAction(ActionType.DigestUpsell);
  };

  return (
    <div className="relative w-full overflow-hidden border-l border-accent-cabbage-default bg-surface-float px-6 py-4 typo-callout">
      <span className="flex flex-row items-center font-bold">
        <MailIcon className="mr-2" />
        Get the must-read posts delivered daily
      </span>
      <p className="mt-2 text-text-tertiary">
        A personalized digest with top posts from your favorite topics, straight
        to your inbox.
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
