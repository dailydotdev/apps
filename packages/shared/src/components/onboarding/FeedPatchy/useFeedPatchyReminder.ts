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
  const { isPushSupported, isInitialized, isSubscribed } =
    usePushNotificationContext();
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
        extra: JSON.stringify({ method }),
      });
    },
    [logEvent],
  );

  const onSkip = useCallback(() => {
    logEvent({ event_name: LogEvent.SkipReadingReminder });
  }, [logEvent]);

  /** Notifications are refused on this device: no prompt would show. */
  const isBlocked = useCallback(() => getWebPermission() === 'denied', []);

  // As the control: the time is saved first, then the device asks, unless it
  // already knows the answer.
  const onSchedule = useCallback(
    async (hour: number, timezone: string): Promise<ReminderOutcome> => {
      logEvent({
        event_name: LogEvent.ScheduleReadingReminder,
        extra: JSON.stringify({ hour, timezone }),
      });
      subscribePersonalizedDigest({
        hour,
        type: UserPersonalizedDigestType.ReadingReminder,
      });

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
    },
    [
      isBlocked,
      isSubscribed,
      logEvent,
      onEnablePush,
      subscribePersonalizedDigest,
    ],
  );

  return {
    /** Unknown until push has initialised; offered until it says otherwise. */
    canRemind: !isInitialized || isPushSupported,
    isBlocked,
    onCommit,
    onSchedule,
    onSkip,
  };
};
