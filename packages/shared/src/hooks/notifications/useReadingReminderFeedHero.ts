import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { LogEvent, NotificationCtaPlacement } from '../../lib/log';
import { webappUrl } from '../../lib/constants';
import { ReadingReminderHeroVariant } from '../../lib/featureManagement';
import { getUserInitialTimezone } from '../../lib/timezones';
import { getCurrentHour } from '../../lib/readingReminderHour';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../useToastNotification';
import { labels } from '../../lib/labels';
import { useReadingReminderHero } from './useReadingReminderHero';
import {
  getReadingReminderCtaParams,
  getReadingReminderPushCtaParams,
  useNotificationCtaAnalytics,
  useNotificationCtaImpression,
} from './useNotificationCtaAnalytics';
import {
  readingReminderPushPromptCopy,
  useReadingReminderPushPrompt,
} from './useReadingReminderPushPrompt';
import usePersistentContext, {
  PersistentContextKeys,
} from '../usePersistentContext';

const SAVED_STEP_MS = 2500;

export type ReadingReminderHeroStep =
  | 'offer'
  | 'picking'
  | 'asking'
  | 'saved'
  | 'denied'
  | 'paused';

export type ReadingReminderHourSource = 'now' | 'picked';

export interface ReadingReminderHabitHero {
  step: ReadingReminderHeroStep;
  /** Keeps "Turn on your daily reading reminder" in the offer. */
  hasReminderCopy: boolean;
  /** The hour now in the reader's timezone. */
  currentHour: number;
  /** The hour being saved, once one was sent. */
  savedHour?: number;
  onSend: (hour: number, source: ReadingReminderHourSource) => Promise<void>;
  onPickTime: () => void;
  /** Asks for push again: after a block, or for a paused reminder. */
  onRetry: () => Promise<void>;
}

interface UseReadingReminderFeedHeroProps {
  // When true, the top-hero placement is suppressed entirely (including
  // its impression event). Used when a parent layout owns the top hero
  // and the feed itself should not render or measure it.
  disableTopHero?: boolean;
}

interface UseReadingReminderFeedHero {
  shouldShowTopHero: boolean;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onEnableHero: () => Promise<void>;
  onDismissHero: () => Promise<void>;
  /** The redesigned card, when this reader gets it. */
  habit?: ReadingReminderHabitHero;
}

export const useReadingReminderFeedHero = ({
  disableTopHero = false,
}: UseReadingReminderFeedHeroProps = {}): UseReadingReminderFeedHero => {
  const { pathname } = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const isHomePage = pathname === webappUrl;
  const {
    shouldShow,
    variant,
    title,
    subtitle,
    onEnable,
    onSchedule,
    onDismiss,
  } = useReadingReminderHero({
    requireMobile: false,
    // Only where the card can show, so a day isn't used up without it.
    enabled: isHomePage && !disableTopHero,
  });
  const isHabit = variant !== ReadingReminderHeroVariant.Control;
  const { logClick, logDismiss } = useNotificationCtaAnalytics();
  const { displayToast } = useToastNotification();
  const [isDismissed, setIsDismissed] = useState(false);
  const [step, setStep] = useState<ReadingReminderHeroStep>('offer');
  const [savedHour, setSavedHour] = useState<number>();
  const [isPushPromptDismissed, setIsPushPromptDismissed, isPushPromptFetched] =
    usePersistentContext<boolean>(
      PersistentContextKeys.ReadingReminderPushPromptDismissed,
      false,
    );
  const pushPrompt = useReadingReminderPushPrompt({
    placement: NotificationCtaPlacement.TopHero,
    enabled:
      !disableTopHero &&
      isHomePage &&
      isPushPromptFetched &&
      !isPushPromptDismissed,
  });

  useEffect(() => {
    if (!shouldShow) {
      setIsDismissed(false);
    }
  }, [shouldShow]);

  // Saving ends eligibility at once, so the confirmation holds the slot.
  const isSaved = step === 'saved';
  useEffect(() => {
    if (!isSaved) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setIsDismissed(true);
      setStep('offer');
    }, SAVED_STEP_MS);
    return () => clearTimeout(timeout);
  }, [isSaved]);

  const shouldShowTopHero =
    !disableTopHero && isHomePage && (shouldShow || isSaved) && !isDismissed;

  const ctaParams = useMemo(() => {
    const params = getReadingReminderCtaParams(
      NotificationCtaPlacement.TopHero,
    );
    return isHabit ? { ...params, extra: { variant } } : params;
  }, [isHabit, variant]);

  useNotificationCtaImpression(ctaParams, shouldShowTopHero);

  const currentHour = getCurrentHour(
    getUserInitialTimezone({ userTimezone: user?.timezone }),
  );

  const onEnableHero = useCallback(async () => {
    logClick(ctaParams);
    await onEnable();
    setIsDismissed(true);
  }, [ctaParams, logClick, onEnable]);

  const onDismissHero = useCallback(async () => {
    setIsDismissed(true);
    logDismiss(ctaParams);
    await onDismiss();
  }, [ctaParams, logDismiss, onDismiss]);

  const onSend = useCallback(
    async (hour: number, source: ReadingReminderHourSource) => {
      logClick({ ...ctaParams, extra: { ...ctaParams.extra, hour, source } });
      setSavedHour(hour);
      setStep('asking');
      try {
        const outcome = await onSchedule(hour);
        if (outcome === 'granted') {
          setStep('saved');
          return;
        }

        setStep(outcome === 'denied' ? 'denied' : 'offer');
      } catch {
        displayToast(labels.error.generic);
        setStep(source === 'picked' ? 'picking' : 'offer');
      }
    },
    [ctaParams, displayToast, logClick, onSchedule],
  );

  const onPickTime = useCallback(() => {
    logEvent({
      event_name: LogEvent.PickReadingReminderTime,
      extra: JSON.stringify({ variant }),
    });
    setStep('picking');
  }, [logEvent, variant]);

  const onRetry = useCallback(
    () => onSend(savedHour ?? currentHour, 'picked'),
    [currentHour, onSend, savedHour],
  );

  const { onEnable: onEnablePush } = pushPrompt;
  const onEnablePushHero = useCallback(async () => {
    await onEnablePush();
  }, [onEnablePush]);

  const onDismissPushHero = useCallback(async () => {
    logDismiss(
      getReadingReminderPushCtaParams(NotificationCtaPlacement.TopHero),
    );
    await setIsPushPromptDismissed(true);
  }, [logDismiss, setIsPushPromptDismissed]);

  if (pushPrompt.shouldShow) {
    return {
      shouldShowTopHero: true,
      title: readingReminderPushPromptCopy.title,
      subtitle: readingReminderPushPromptCopy.heroSubtitle,
      ctaLabel: readingReminderPushPromptCopy.cta,
      onEnableHero: onEnablePushHero,
      onDismissHero: onDismissPushHero,
      habit: {
        step: 'paused',
        hasReminderCopy: false,
        currentHour,
        onSend,
        onPickTime,
        onRetry: onEnablePushHero,
      },
    };
  }

  return {
    shouldShowTopHero,
    title,
    subtitle,
    onEnableHero,
    onDismissHero,
    ...(isHabit && {
      habit: {
        step,
        hasReminderCopy:
          variant === ReadingReminderHeroVariant.HabitReminderCopy,
        currentHour,
        savedHour,
        onSend,
        onPickTime,
        onRetry,
      },
    }),
  };
};
