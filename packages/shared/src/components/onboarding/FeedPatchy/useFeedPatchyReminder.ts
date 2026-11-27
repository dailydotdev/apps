import { useCallback, useEffect, useRef } from 'react';
import type { PushPermissionOutcome } from '../../../hooks/notifications/usePushPermissionOutcome';
import { usePushPermissionOutcome } from '../../../hooks/notifications/usePushPermissionOutcome';
import { usePersonalizedDigest } from '../../../hooks/usePersonalizedDigest';
import { UserPersonalizedDigestType } from '../../../graphql/users';
import { useLogContext } from '../../../contexts/LogContext';
import {
  LogEvent,
  NotificationPromptSource,
  TargetType,
} from '../../../lib/log';

/** How the reminder ended, once a time was picked. */
export type ReminderOutcome = PushPermissionOutcome;

export type FeedMethod = 'drag' | 'tap';

// Logs the same events as the control's reading-reminder step, so the two
// arms read side by side; only the commitment itself is new. `variant` names
// the experiment arm in every event.
export const useFeedPatchyReminder = (variant = 'feed_patchy') => {
  const { logEvent } = useLogContext();
  const { isBlocked, requestPush } = usePushPermissionOutcome(
    NotificationPromptSource.ReadingReminder,
  );
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
      extra: JSON.stringify({ variant }),
    });
  }, [logEvent, variant]);

  const onCommit = useCallback(
    (method: FeedMethod) => {
      logEvent({
        event_name: LogEvent.CommitOnboarding,
        extra: JSON.stringify({ method, variant }),
      });
    },
    [logEvent, variant],
  );

  const onSkip = useCallback(() => {
    logEvent({
      event_name: LogEvent.SkipReadingReminder,
      extra: JSON.stringify({ variant }),
    });
  }, [logEvent, variant]);

  // As the control: the time is saved first, then the device asks, unless it
  // already knows the answer. The answer is logged too, refusals included,
  // which the push context alone does not record.
  const onSchedule = useCallback(
    async (hour: number, timezone: string): Promise<ReminderOutcome> => {
      logEvent({
        event_name: LogEvent.ScheduleReadingReminder,
        extra: JSON.stringify({ hour, timezone, variant }),
      });
      subscribePersonalizedDigest({
        hour,
        type: UserPersonalizedDigestType.ReadingReminder,
      });

      const outcome = await requestPush();
      logEvent({
        event_name: LogEvent.ReadingReminderPermission,
        extra: JSON.stringify({ outcome, variant }),
      });

      return outcome;
    },
    [requestPush, logEvent, subscribePersonalizedDigest, variant],
  );

  return {
    isBlocked,
    onCommit,
    onSchedule,
    onSkip,
  };
};
