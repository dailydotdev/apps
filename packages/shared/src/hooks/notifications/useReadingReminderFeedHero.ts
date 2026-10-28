import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NotificationCtaPlacement } from '../../lib/log';
import { webappUrl } from '../../lib/constants';
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
}

export const useReadingReminderFeedHero = ({
  disableTopHero = false,
}: UseReadingReminderFeedHeroProps = {}): UseReadingReminderFeedHero => {
  const { pathname } = useRouter();
  const { shouldShow, title, subtitle, onEnable, onDismiss } =
    useReadingReminderHero({
      requireMobile: false,
    });
  const isHomePage = pathname === webappUrl;
  const shouldEvaluateReminderPlacement = isHomePage && shouldShow;
  const { logClick, logDismiss } = useNotificationCtaAnalytics();
  const [isDismissed, setIsDismissed] = useState(false);
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

  const canShowReminderPlacements = shouldEvaluateReminderPlacement;
  const shouldShowTopHero =
    !disableTopHero && canShowReminderPlacements && !isDismissed;

  useNotificationCtaImpression(
    getReadingReminderCtaParams(NotificationCtaPlacement.TopHero),
    shouldShowTopHero,
  );

  const onEnableHero = useCallback(async () => {
    logClick(getReadingReminderCtaParams(NotificationCtaPlacement.TopHero));
    await onEnable();
    setIsDismissed(true);
  }, [logClick, onEnable]);

  const onDismissHero = useCallback(async () => {
    setIsDismissed(true);
    logDismiss(getReadingReminderCtaParams(NotificationCtaPlacement.TopHero));
    await onDismiss();
  }, [logDismiss, onDismiss]);

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
    };
  }

  return {
    shouldShowTopHero,
    title,
    subtitle,
    onEnableHero,
    onDismissHero,
  };
};
