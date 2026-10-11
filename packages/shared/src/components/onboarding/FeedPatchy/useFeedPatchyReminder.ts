import { useCallback, useEffect, useRef } from 'react';
import { usePushNotificationMutation } from '../../../hooks/notifications/usePushNotificationMutation';
import { usePushNotificationContext } from '../../../contexts/PushNotificationContext';
import { usePersonalizedDigest } from '../../../hooks/usePersonalizedDigest';
import { UserPersonalizedDigestType } from '../../../graphql/users';
import { useLogContext } from '../../../contexts/LogContext';
import {
  LogEvent,
  NotificationPromptSource,
  TargetType,
} from '../../../lib/log';
import { isIOSNative } from '../../../lib/func';

/** How the reminder ended, once a time was picked. */
export type ReminderOutcome = 'granted' | 'denied' | 'dismissed';

export type FeedMethod = 'drag' | 'tap';

/** Web only: the iOS app asks through its own bridge and has no Notification. */
const getWebPermission = (): NotificationPermission | undefined =>
  isIOSNative() ? undefined : globalThis.Notification?.permission;

// Logs the same events as the control's reading-reminder step, so the two
// arms read side by side; only the commitment itself is new.
export const useFeedPatchyReminder = () => {
  const { logEvent } = useLogContext();
  const { isSubscribed } = usePushNotificationContext();
  const { onEnablePush } = usePushNotificationMutation();
  const { subscribePersonalizedDigest } = usePersonalizedDigest();
  const isLogged = useRef(false);

  useEffect(() => {
    if (isLogged.current) {
      return;
    }
    isLogged.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.ReadingReminder,
      extra: JSON.stringify({ variant: 'feed_patchy' }),
    });
  }, [logEvent]);

  const onCommit = useCallback(
    (method: FeedMethod) => {
      logEvent({
        event_name: LogEvent.CommitOnboarding,
        extra: JSON.stringify({ method, variant: 'feed_patchy' }),
      });
    },
    [logEvent],
  );

  const onSkip = useCallback(() => {
    logEvent({
      event_name: LogEvent.SkipReadingReminder,
      extra: JSON.stringify({ variant: 'feed_patchy' }),
    });
  }, [logEvent]);

  /** Notifications are refused on this device: no prompt would show. */
  const isBlocked = useCallback(() => getWebPermission() === 'denied', []);

  const getOutcome = useCallback(async (): Promise<ReminderOutcome> => {
    if (isSubscribed) {
      return 'granted';
    }

    if (isBlocked()) {
      return 'denied';
    }

    const isGranted = await onEnablePush(
      NotificationPromptSource.ReadingReminder,
    );

    if (isGranted) {
      return 'granted';
    }

    // iOS has no way to close its alert without an answer.
    return isIOSNative() || getWebPermission() === 'denied'
      ? 'denied'
      : 'dismissed';
  }, [isBlocked, isSubscribed, onEnablePush]);

  // As the control: the time is saved first, then the device asks, unless it
  // already knows the answer. The answer is logged too, refusals included,
  // which the push context alone does not record.
  const onSchedule = useCallback(
    async (hour: number, timezone: string): Promise<ReminderOutcome> => {
      logEvent({
        event_name: LogEvent.ScheduleReadingReminder,
        extra: JSON.stringify({ hour, timezone, variant: 'feed_patchy' }),
      });
      subscribePersonalizedDigest({
        hour,
        type: UserPersonalizedDigestType.ReadingReminder,
      });

      const outcome = await getOutcome();
      logEvent({
        event_name: LogEvent.ReadingReminderPermission,
        extra: JSON.stringify({ outcome, variant: 'feed_patchy' }),
      });

      return outcome;
    },
    [getOutcome, logEvent, subscribePersonalizedDigest],
  );

  return {
    isBlocked,
    onCommit,
    onSchedule,
    onSkip,
  };
};
