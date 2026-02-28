import { isToday } from 'date-fns';
import { useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { useConditionalFeature } from '../useConditionalFeature';
import { SendType, usePersonalizedDigest } from '../usePersonalizedDigest';
import usePersistentContext, {
  PersistentContextKeys,
} from '../usePersistentContext';
import { useViewSize, ViewSize } from '../useViewSize';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import { LogEvent, NotificationPromptSource } from '../../lib/log';
import { featureReadingReminderMobile } from '../../lib/featureManagement';

interface UseReadingReminderHero {
  shouldShow: boolean;
  onDismiss: () => void;
  onEnable: () => Promise<void>;
}

const DEFAULT_READING_REMINDER_HOUR = 9;

const getHasSeenToday = (lastSeen: string | null): boolean => {
  if (!lastSeen) {
    return false;
  }

  const parsedDate = new Date(lastSeen);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return isToday(parsedDate);
};

export const useReadingReminderHero = (): UseReadingReminderHero => {
  const { isLoggedIn, user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { onEnablePush } = usePushNotificationMutation();
  const { getPersonalizedDigest, subscribePersonalizedDigest } =
    usePersonalizedDigest();
  const [lastSeen, setLastSeen, isFetched] = usePersistentContext<
    string | null
  >(PersistentContextKeys.ReadingReminderLastSeen, null);

  const isMobile = useViewSize(ViewSize.MobileL);
  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: featureReadingReminderMobile,
    shouldEvaluate: isMobile && isLoggedIn,
  });

  const readingReminderDigest = getPersonalizedDigest(
    UserPersonalizedDigestType.ReadingReminder,
  );

  const hasSeenToday = getHasSeenToday(lastSeen);

  const onDismiss = useCallback(() => {
    setLastSeen(new Date().toISOString());
    logEvent({ event_name: LogEvent.SkipReadingReminder });
  }, [logEvent, setLastSeen]);

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

  const shouldShow =
    isLoggedIn &&
    isMobile &&
    isFeatureEnabled &&
    !readingReminderDigest &&
    !hasSeenToday &&
    isFetched;

  return { shouldShow, onDismiss, onEnable };
};
