import { isToday } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { isTodayStamp } from '../../lib/dateFormat';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { SendType, usePersonalizedDigest } from '../usePersonalizedDigest';
import usePersistentContext, {
  PersistentContextKeys,
} from '../usePersistentContext';
import { useViewSize, ViewSize } from '../useViewSize';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import type { PushPermissionOutcome } from './usePushPermissionOutcome';
import { usePushPermissionOutcome } from './usePushPermissionOutcome';
import { LogEvent, NotificationPromptSource } from '../../lib/log';
import {
  featureReadingReminderHeroCopy,
  featureReadingReminderHeroVariant,
  ReadingReminderHeroVariant,
} from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import { DEFAULT_READING_REMINDER_HOUR } from '../../lib/readingReminderHour';

interface UseReadingReminderHero {
  shouldShow: boolean;
  variant: ReadingReminderHeroVariant;
  title: string;
  subtitle: string;
  onEnable: () => Promise<void>;
  /** Asks for push first and saves the reminder only once it's allowed. */
  onSchedule: (hour: number) => Promise<PushPermissionOutcome>;
  onDismiss: () => Promise<void>;
}

interface UseReadingReminderHeroProps {
  requireMobile?: boolean;
  enabled?: boolean;
}

const READING_REMINDER_DISMISSED = 'dismissed';

const isDismissedValue = (lastSeen: string | null): boolean =>
  lastSeen === READING_REMINDER_DISMISSED;

const getHasSeenToday = (lastSeen: string | null): boolean =>
  !isDismissedValue(lastSeen) && isTodayStamp(lastSeen);

const getIsRegisteredToday = (createdAt?: string | Date): boolean => {
  if (!createdAt) {
    return false;
  }

  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return isToday(parsedDate);
};

/**
 * Whether the hero has what it decides on, the digest subscriptions and the
 * last-seen stamp, so a card sharing the top strip can land in the same
 * commit instead of being squeezed aside when this one arrives.
 */
export const useReadingReminderHeroSettled = (): boolean => {
  const { isLoggedIn } = useAuthContext();
  const { isSettled } = usePersonalizedDigest();
  const [, , isFetched] = usePersistentContext<string | null>(
    PersistentContextKeys.ReadingReminderLastSeen,
    null,
  );

  return !isLoggedIn || (isSettled && isFetched);
};

export const useReadingReminderHero = ({
  requireMobile = true,
  enabled = true,
}: UseReadingReminderHeroProps = {}): UseReadingReminderHero => {
  const { isLoggedIn, user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { onEnablePush } = usePushNotificationMutation();
  const { requestPush } = usePushPermissionOutcome(
    NotificationPromptSource.ReadingReminder,
  );
  const {
    getPersonalizedDigest,
    isLoading: isDigestLoading,
    subscribePersonalizedDigest,
  } = usePersonalizedDigest({ enabled });
  const [lastSeen, setLastSeen, isFetched] = usePersistentContext<
    string | null
  >(PersistentContextKeys.ReadingReminderLastSeen, null);

  const readingReminderDigest = getPersonalizedDigest(
    UserPersonalizedDigestType.ReadingReminder,
  );
  const isSubscribedToReadingReminder = !!readingReminderDigest;

  const isRegisteredToday = getIsRegisteredToday(user?.createdAt);
  const isDismissed = isDismissedValue(lastSeen);

  const {
    isPushSupported,
    isInitialized: isPushInitialized,
    isSubscribed: isPushSubscribed,
  } = usePushNotificationContext();
  const canReceivePush =
    isPushInitialized && (isPushSupported || isPushSubscribed);
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const isDismissedOnAccount =
    isActionsFetched &&
    checkHasCompleted(ActionType.DismissReadingReminderHero);

  // Closes from before the account kept them carry over to it.
  useEffect(() => {
    if (isDismissed && isActionsFetched && !isDismissedOnAccount) {
      completeAction(ActionType.DismissReadingReminderHero);
    }
  }, [completeAction, isActionsFetched, isDismissed, isDismissedOnAccount]);

  const isMobile = useViewSize(ViewSize.MobileL);
  const isEligibleViewSize = !requireMobile || isMobile;
  const shouldEvaluate =
    enabled &&
    isEligibleViewSize &&
    isLoggedIn &&
    canReceivePush &&
    !isDigestLoading &&
    !isSubscribedToReadingReminder &&
    !isRegisteredToday &&
    !isDismissed;
  const { value: copy } = useConditionalFeature({
    feature: featureReadingReminderHeroCopy,
    shouldEvaluate,
  });
  const { value: variantValue, isLoading: isVariantLoading } =
    useConditionalFeature({
      feature: featureReadingReminderHeroVariant,
      shouldEvaluate,
    });
  const variant = variantValue as ReadingReminderHeroVariant;
  // The variant closes on the account, so it waits until that is known.
  const isClosedForVariant =
    variant !== ReadingReminderHeroVariant.Control &&
    (!isActionsFetched || isDismissedOnAccount);

  const hasSeenToday = getHasSeenToday(lastSeen);
  const [hasShownInSession, setHasShownInSession] = useState(false);
  const shouldShowBase =
    shouldEvaluate &&
    !hasSeenToday &&
    isFetched &&
    !isVariantLoading &&
    !isClosedForVariant;

  useEffect(() => {
    if (!shouldShowBase || hasShownInSession) {
      return;
    }

    setHasShownInSession(true);
    setLastSeen(new Date().toISOString());
  }, [hasShownInSession, setLastSeen, shouldShowBase]);

  const onEnable = useCallback(async () => {
    const timezone =
      user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

    await subscribePersonalizedDigest({
      type: UserPersonalizedDigestType.ReadingReminder,
      sendType: SendType.Daily,
      hour: DEFAULT_READING_REMINDER_HOUR,
    });

    await onEnablePush(NotificationPromptSource.ReadingReminder);
    await setLastSeen(new Date().toISOString());

    logEvent({
      event_name: LogEvent.ScheduleReadingReminder,
      extra: JSON.stringify({
        hour: DEFAULT_READING_REMINDER_HOUR,
        timezone,
      }),
    });
  }, [logEvent, onEnablePush, setLastSeen, subscribePersonalizedDigest, user]);

  const onSchedule = useCallback(
    async (hour: number): Promise<PushPermissionOutcome> => {
      const outcome = await requestPush();
      logEvent({
        event_name: LogEvent.ReadingReminderPermission,
        extra: JSON.stringify({ outcome, hour, variant }),
      });

      if (outcome !== 'granted') {
        return outcome;
      }

      await subscribePersonalizedDigest({
        type: UserPersonalizedDigestType.ReadingReminder,
        sendType: SendType.Daily,
        hour,
      });
      logEvent({
        event_name: LogEvent.ScheduleReadingReminder,
        extra: JSON.stringify({
          hour,
          timezone:
            user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
          variant,
        }),
      });

      return outcome;
    },
    [logEvent, requestPush, subscribePersonalizedDigest, user, variant],
  );

  const onDismiss = useCallback(async () => {
    await setLastSeen(READING_REMINDER_DISMISSED);
    if (variant !== ReadingReminderHeroVariant.Control) {
      await completeAction(ActionType.DismissReadingReminderHero);
    }
  }, [completeAction, setLastSeen, variant]);

  const shouldShow =
    !isSubscribedToReadingReminder &&
    !isDismissed &&
    (shouldShowBase || hasShownInSession);

  return {
    shouldShow,
    variant,
    title: copy.title,
    subtitle: copy.subtitle,
    onEnable,
    onSchedule,
    onDismiss,
  };
};
