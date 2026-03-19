import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NotificationCtaPlacement } from '../../lib/log';
import { webappUrl } from '../../lib/constants';
import { useReadingReminderHero } from './useReadingReminderHero';
import { useNotificationCtaExperiment } from './useNotificationCtaExperiment';
import {
  getReadingReminderCtaParams,
  useNotificationCtaAnalytics,
  useNotificationCtaImpression,
} from './useNotificationCtaAnalytics';

const HERO_INSERT_INDEX = 6;
const HERO_SCROLL_THRESHOLD_PX = 300;

interface UseReadingReminderFeedHeroProps {
  itemCount: number;
  itemsPerRow: number;
}

interface UseReadingReminderFeedHero {
  heroInsertIndex: number;
  shouldShowInFeedHero: boolean;
  title: string;
  subtitle: string;
  shouldShowDismiss: boolean;
  onEnableInFeedHero: () => Promise<void>;
  onDismissInFeedHero: () => Promise<void>;
}

export const useReadingReminderFeedHero = ({
  itemCount,
  itemsPerRow,
}: UseReadingReminderFeedHeroProps): UseReadingReminderFeedHero => {
  const safeItemsPerRow = Math.max(1, itemsPerRow);
  const heroInsertIndex =
    Math.ceil(HERO_INSERT_INDEX / safeItemsPerRow) * safeItemsPerRow;
  const { pathname } = useRouter();
  const {
    shouldShow,
    title,
    subtitle,
    shouldShowDismiss,
    onEnable,
    onDismiss,
  } = useReadingReminderHero();
  const isHomePage = pathname === webappUrl;
  const shouldEvaluateReminderExperiment = isHomePage && shouldShow;
  const { isEnabled: isNotificationCtaExperimentEnabled } =
    useNotificationCtaExperiment({
      shouldEvaluate: shouldEvaluateReminderExperiment,
    });
  const { logClick, logDismiss } = useNotificationCtaAnalytics();
  const [hasScrolledForHero, setHasScrolledForHero] = useState(false);
  const [isInFeedHeroDismissed, setIsInFeedHeroDismissed] = useState(false);

  useEffect(() => {
    if (!shouldShow || hasScrolledForHero) {
      return undefined;
    }

    const onScroll = () => {
      if (window.scrollY >= HERO_SCROLL_THRESHOLD_PX) {
        setHasScrolledForHero(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasScrolledForHero, shouldShow]);

  useEffect(() => {
    if (!shouldShow) {
      setIsInFeedHeroDismissed(false);
    }
  }, [shouldShow]);

  const canShowReminderPlacements =
    isNotificationCtaExperimentEnabled && shouldEvaluateReminderExperiment;
  const shouldShowInFeedHero =
    canShowReminderPlacements &&
    hasScrolledForHero &&
    !isInFeedHeroDismissed &&
    itemCount > heroInsertIndex;

  useNotificationCtaImpression(
    getReadingReminderCtaParams(NotificationCtaPlacement.InFeedHero),
    shouldShowInFeedHero,
  );

  const onEnableInFeedHero = useCallback(async () => {
    logClick(getReadingReminderCtaParams(NotificationCtaPlacement.InFeedHero));
    await onEnable();
    setIsInFeedHeroDismissed(true);
  }, [logClick, onEnable]);

  const onDismissInFeedHero = useCallback(async () => {
    setIsInFeedHeroDismissed(true);
    logDismiss(
      getReadingReminderCtaParams(NotificationCtaPlacement.InFeedHero),
    );
    await onDismiss();
  }, [logDismiss, onDismiss]);

  return {
    heroInsertIndex,
    shouldShowInFeedHero,
    title,
    subtitle,
    shouldShowDismiss,
    onEnableInFeedHero,
    onDismissInFeedHero,
  };
};
