import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NotificationCtaPlacement } from '../../lib/log';
import { webappUrl } from '../../lib/constants';
import { useReadingReminderHero } from './useReadingReminderHero';
import {
  getReadingReminderCtaParams,
  useNotificationCtaAnalytics,
  useNotificationCtaImpression,
} from './useNotificationCtaAnalytics';

interface UseReadingReminderFeedHeroProps {
  // When true, the top-hero placement is suppressed entirely (including
  // its impression event). Used when a parent layout owns the top hero
  // and the feed itself should not render or measure it.
  disableTopHero?: boolean;
  // The extension new tab is the home surface but has no Next router, so
  // `pathname` can never match `webappUrl` there. Surfaces that know they
  // are the home feed say so instead of being inferred from the route.
  isHomeSurface?: boolean;
  // Shells that mount this on every route keep the digest query from firing
  // where the placement could never render.
  enabled?: boolean;
}

interface UseReadingReminderFeedHero {
  shouldShowTopHero: boolean;
  title: string;
  subtitle: string;
  onEnableHero: () => Promise<void>;
  onDismissHero: () => Promise<void>;
}

export const useReadingReminderFeedHero = ({
  disableTopHero = false,
  isHomeSurface,
  enabled = true,
}: UseReadingReminderFeedHeroProps = {}): UseReadingReminderFeedHero => {
  const { pathname } = useRouter() ?? {};
  const { shouldShow, title, subtitle, onEnable, onDismiss } =
    useReadingReminderHero({
      requireMobile: false,
      enabled,
    });
  const isHomePage = isHomeSurface ?? pathname === webappUrl;
  const shouldEvaluateReminderPlacement = enabled && isHomePage && shouldShow;
  const { logClick, logDismiss } = useNotificationCtaAnalytics();
  const [isDismissed, setIsDismissed] = useState(false);

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

  return {
    shouldShowTopHero,
    title,
    subtitle,
    onEnableHero,
    onDismissHero,
  };
};
