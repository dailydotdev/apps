import { useCallback } from 'react';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { usePersonalizedDigest } from '../usePersonalizedDigest';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureReadingReminderPushPrompt } from '../../lib/featureManagement';
import type { NotificationCtaPlacement } from '../../lib/log';
import { NotificationPromptSource } from '../../lib/log';
import {
  getReadingReminderPushCtaParams,
  useNotificationCtaAnalytics,
  useNotificationCtaImpression,
} from './useNotificationCtaAnalytics';

export const readingReminderPushPromptCopy = {
  title: 'Your reminder is on, but we can’t reach you',
  heroSubtitle: 'Turn on notifications to get your daily reading reminder.',
  cta: 'Turn on notifications',
};

interface UseReadingReminderPushPromptProps {
  placement: NotificationCtaPlacement;
  enabled?: boolean;
}

interface UseReadingReminderPushPrompt {
  shouldShow: boolean;
  onEnable: () => Promise<boolean>;
}

export const useReadingReminderPushPrompt = ({
  placement,
  enabled = true,
}: UseReadingReminderPushPromptProps): UseReadingReminderPushPrompt => {
  const { getPersonalizedDigest } = usePersonalizedDigest({ enabled });
  const { isPushSupported, isInitialized, isSubscribed } =
    usePushNotificationContext();
  const { onEnablePush, acceptedJustNow } = usePushNotificationMutation();
  const { logClick } = useNotificationCtaAnalytics();
  const isPaused = !!getPersonalizedDigest(
    UserPersonalizedDigestType.ReadingReminder,
  )?.deliveryPaused;
  // Native apps don't clear the paused state until the next delivery attempt,
  // so this device's own subscription wins over it
  const isEligible =
    enabled &&
    isPaused &&
    isPushSupported &&
    isInitialized &&
    !isSubscribed &&
    !acceptedJustNow;
  const { value: isPromptEnabled } = useConditionalFeature({
    feature: featureReadingReminderPushPrompt,
    shouldEvaluate: isEligible,
  });
  const shouldShow = isEligible && isPromptEnabled;

  useNotificationCtaImpression(
    getReadingReminderPushCtaParams(placement),
    shouldShow,
  );

  const onEnable = useCallback(async () => {
    logClick(getReadingReminderPushCtaParams(placement));
    return onEnablePush(NotificationPromptSource.ReadingReminderPaused);
  }, [logClick, onEnablePush, placement]);

  return { shouldShow, onEnable };
};
