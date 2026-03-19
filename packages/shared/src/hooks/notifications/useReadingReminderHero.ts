import { isToday } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { SendType, usePersonalizedDigest } from '../usePersonalizedDigest';
import usePersistentContext, {
  PersistentContextKeys,
} from '../usePersistentContext';
import { useViewSize, ViewSize } from '../useViewSize';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import { LogEvent, NotificationPromptSource } from '../../lib/log';
import {
  featureReadingReminderHeroCopy,
  featureReadingReminderHeroDismiss,
} from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';

interface UseReadingReminderHero {
  shouldShow: boolean;
  title: string;
  subtitle: string;
  shouldShowDismiss: boolean;
  onEnable: () => Promise<void>;
  onDismiss: () => Promise<void>;
}

interface UseReadingReminderHeroProps {
  requireMobile?: boolean;
}

const DEFAULT_READING_REMINDER_HOUR = 9;
const READING_REMINDER_DISMISSED = 'dismissed';

const isDismissedValue = (lastSeen: string | null): boolean =>
  lastSeen === READING_REMINDER_DISMISSED;

const getHasSeenToday = (lastSeen: string | null): boolean => {
  if (!lastSeen || isDismissedValue(lastSeen)) {
    return false;
  }

  const parsedDate = new Date(lastSeen);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return isToday(parsedDate);
};

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

export const useReadingReminderHero = ({
  requireMobile = true,
}: UseReadingReminderHeroProps = {}): UseReadingReminderHero => {
  const { isLoggedIn, user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { onEnablePush } = usePushNotificationMutation();
  const {
    getPersonalizedDigest,
    isLoading: isDigestLoading,
    subscribePersonalizedDigest,
  } = usePersonalizedDigest();
  const [lastSeen, setLastSeen, isFetched] = usePersistentContext<
    string | null
  >(PersistentContextKeys.ReadingReminderLastSeen, null);

  const readingReminderDigest = getPersonalizedDigest(
    UserPersonalizedDigestType.ReadingReminder,
  );
  const isSubscribedToReadingReminder = !!readingReminderDigest;

  const isRegisteredToday = getIsRegisteredToday(user?.createdAt);
  const isDismissed = isDismissedValue(lastSeen);

  const isMobile = useViewSize(ViewSize.MobileL);
  const isEligibleViewSize = !requireMobile || isMobile;
  const shouldEvaluate =
    isEligibleViewSize &&
    isLoggedIn &&
    !isDigestLoading &&
    !isSubscribedToReadingReminder &&
    !isRegisteredToday &&
    !isDismissed;
  const { value: shouldShowDismiss } = useConditionalFeature({
    feature: featureReadingReminderHeroDismiss,
    shouldEvaluate,
  });
  const { value: copy } = useConditionalFeature({
    feature: featureReadingReminderHeroCopy,
    shouldEvaluate,
  });

  const hasSeenToday = getHasSeenToday(lastSeen);
  const [hasShownInSession, setHasShownInSession] = useState(false);
  const shouldShowBase = shouldEvaluate && !hasSeenToday && isFetched;

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

  const onDismiss = useCallback(async () => {
    await setLastSeen(READING_REMINDER_DISMISSED);
  }, [setLastSeen]);

  const shouldShow =
    !isSubscribedToReadingReminder &&
    !isDismissed &&
    (shouldShowBase || hasShownInSession);

  return {
    shouldShow,
    title: copy.title,
    subtitle: copy.subtitle,
    shouldShowDismiss,
    onEnable,
    onDismiss,
  };
};
