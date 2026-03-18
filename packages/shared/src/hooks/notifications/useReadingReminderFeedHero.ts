import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NotificationCtaPlacement } from '../../lib/log';
import { webappUrl } from '../../lib/constants';
import { useReadingReminderHero } from './useReadingReminderHero';
import {
  NotificationCtaPreviewPlacement,
  useNotificationCtaExperiment,
} from './useNotificationCtaExperiment';
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
  shouldShowTopHero: boolean;
  shouldShowInFeedHero: boolean;
  title: string;
  subtitle: string;
  shouldShowDismiss: boolean;
  onEnableTopHero: () => Promise<void>;
  onDismissTopHero: () => Promise<void>;
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
  const {
    isEnabled: isNotificationCtaExperimentEnabled,
    isPlacementForced,
    shouldHidePlacement,
  } = useNotificationCtaExperiment({
    shouldEvaluate: shouldEvaluateReminderExperiment,
  });
  const isTopHeroForced = isPlacementForced(
    NotificationCtaPreviewPlacement.TopHero,
  );
  const isInFeedHeroForced = isPlacementForced(
    NotificationCtaPreviewPlacement.InFeedHero,
  );
  const shouldHideTopHero = shouldHidePlacement(
    NotificationCtaPreviewPlacement.TopHero,
  );
  const shouldHideInFeedHero = shouldHidePlacement(
    NotificationCtaPreviewPlacement.InFeedHero,
  );
  const { logClick, logDismiss } = useNotificationCtaAnalytics();
  const [hasScrolledForHero, setHasScrolledForHero] =
    useState(isInFeedHeroForced);
  const [isInFeedHeroDismissed, setIsInFeedHeroDismissed] = useState(false);
  const [isTopHeroDismissed, setIsTopHeroDismissed] = useState(false);

  useEffect(() => {
    if (!shouldShow || isInFeedHeroForced || hasScrolledForHero) {
      return undefined;
    }

    const onScroll = () => {
      if (window.scrollY >= HERO_SCROLL_THRESHOLD_PX) {
        setHasScrolledForHero(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasScrolledForHero, isInFeedHeroForced, shouldShow]);

  useEffect(() => {
    if (!isInFeedHeroForced) {
      return;
    }

    setHasScrolledForHero(true);
  }, [isInFeedHeroForced]);

  useEffect(() => {
    if (!shouldShow) {
      setIsInFeedHeroDismissed(false);
      setIsTopHeroDismissed(false);
    }
  }, [shouldShow]);

  const canShowReminderPlacements =
    isNotificationCtaExperimentEnabled && shouldEvaluateReminderExperiment;
  const shouldShowTopHero =
    canShowReminderPlacements &&
    isTopHeroForced &&
    !shouldHideTopHero &&
    !isTopHeroDismissed;
  const shouldShowInFeedHero =
    canShowReminderPlacements &&
    !shouldHideInFeedHero &&
    (isInFeedHeroForced || hasScrolledForHero) &&
    !isInFeedHeroDismissed &&
    itemCount > heroInsertIndex;

  useNotificationCtaImpression(
    getReadingReminderCtaParams(NotificationCtaPlacement.TopHero),
    shouldShowTopHero,
  );
  useNotificationCtaImpression(
    getReadingReminderCtaParams(NotificationCtaPlacement.InFeedHero),
    shouldShowInFeedHero,
  );

  const onEnableTopHero = useCallback(async () => {
    logClick(getReadingReminderCtaParams(NotificationCtaPlacement.TopHero));
    await onEnable();
    setIsTopHeroDismissed(true);
  }, [logClick, onEnable]);

  const onDismissTopHero = useCallback(async () => {
    setIsTopHeroDismissed(true);
    logDismiss(getReadingReminderCtaParams(NotificationCtaPlacement.TopHero));
    await onDismiss();
  }, [logDismiss, onDismiss]);

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
    shouldShowTopHero,
    shouldShowInFeedHero,
    title,
    subtitle,
    shouldShowDismiss,
    onEnableTopHero,
    onDismissTopHero,
    onEnableInFeedHero,
    onDismissInFeedHero,
  };
};
