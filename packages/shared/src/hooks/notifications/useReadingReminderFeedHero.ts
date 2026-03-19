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
import { useReadingReminderVariation } from './useReadingReminderVariation';

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
  } = useReadingReminderHero({
    requireMobile: false,
  });
  const isHomePage = pathname === webappUrl;
  const shouldEvaluateReminderPlacement = isHomePage && shouldShow;
  const { isHero, isInline } = useReadingReminderVariation({
    shouldEvaluate: shouldEvaluateReminderPlacement,
  });
  const { logClick, logDismiss } = useNotificationCtaAnalytics();
  const [hasScrolledForHero, setHasScrolledForHero] = useState(false);
  const [isInFeedHeroDismissed, setIsInFeedHeroDismissed] = useState(false);
  const [isTopHeroDismissed, setIsTopHeroDismissed] = useState(false);

  useEffect(() => {
    if (!shouldShow || !isInline || hasScrolledForHero) {
      return undefined;
    }

    const onScroll = () => {
      if (window.scrollY >= HERO_SCROLL_THRESHOLD_PX) {
        setHasScrolledForHero(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasScrolledForHero, isInline, shouldShow]);

  useEffect(() => {
    if (!shouldShow) {
      setHasScrolledForHero(false);
      setIsInFeedHeroDismissed(false);
      setIsTopHeroDismissed(false);
    }
  }, [shouldShow]);

  const canShowReminderPlacements = shouldEvaluateReminderPlacement;
  const shouldShowTopHero =
    canShowReminderPlacements && isHero && !isTopHeroDismissed;
  const shouldShowInFeedHero =
    canShowReminderPlacements &&
    isInline &&
    hasScrolledForHero &&
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
