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
type ReadingReminderHeroPlacement =
  | NotificationCtaPlacement.TopHero
  | NotificationCtaPlacement.InFeedHero;

interface UseReadingReminderFeedHeroProps {
  itemCount: number;
  itemsPerRow: number;
  firstSlotOffset?: number;
}

interface UseReadingReminderFeedHero {
  adjustedHeroInsertIndex: number;
  shouldShowTopHero: boolean;
  shouldShowInFeedHero: boolean;
  title: string;
  subtitle: string;
  onEnableHero: (placement: ReadingReminderHeroPlacement) => Promise<void>;
  onDismissHero: (placement: ReadingReminderHeroPlacement) => Promise<void>;
}

const getInitialDismissedPlacements = (): Record<
  ReadingReminderHeroPlacement,
  boolean
> => ({
  [NotificationCtaPlacement.TopHero]: false,
  [NotificationCtaPlacement.InFeedHero]: false,
});

export const useReadingReminderFeedHero = ({
  itemCount,
  itemsPerRow,
  firstSlotOffset = 0,
}: UseReadingReminderFeedHeroProps): UseReadingReminderFeedHero => {
  const safeItemsPerRow = Math.max(1, itemsPerRow);
  const heroInsertIndex =
    Math.ceil(HERO_INSERT_INDEX / safeItemsPerRow) * safeItemsPerRow;
  const adjustedHeroInsertIndex = Math.max(
    heroInsertIndex - firstSlotOffset,
    0,
  );
  const { pathname } = useRouter();
  const { shouldShow, title, subtitle, onEnable, onDismiss } =
    useReadingReminderHero({
      requireMobile: false,
    });
  const isHomePage = pathname === webappUrl;
  const shouldEvaluateReminderPlacement = isHomePage && shouldShow;
  const { isHero, isInline } = useReadingReminderVariation({
    shouldEvaluate: shouldEvaluateReminderPlacement,
  });
  const { logClick, logDismiss } = useNotificationCtaAnalytics();
  const [hasScrolledForHero, setHasScrolledForHero] = useState(false);
  const [dismissedPlacements, setDismissedPlacements] = useState(
    getInitialDismissedPlacements,
  );

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
      setDismissedPlacements(getInitialDismissedPlacements());
    }
  }, [shouldShow]);

  const canShowReminderPlacements = shouldEvaluateReminderPlacement;
  const shouldShowTopHero =
    canShowReminderPlacements &&
    isHero &&
    !dismissedPlacements[NotificationCtaPlacement.TopHero];
  const shouldShowInFeedHero =
    canShowReminderPlacements &&
    isInline &&
    hasScrolledForHero &&
    !dismissedPlacements[NotificationCtaPlacement.InFeedHero] &&
    itemCount > adjustedHeroInsertIndex;

  useNotificationCtaImpression(
    getReadingReminderCtaParams(NotificationCtaPlacement.TopHero),
    shouldShowTopHero,
  );
  useNotificationCtaImpression(
    getReadingReminderCtaParams(NotificationCtaPlacement.InFeedHero),
    shouldShowInFeedHero,
  );

  const setPlacementDismissed = useCallback(
    (placement: ReadingReminderHeroPlacement) => {
      setDismissedPlacements((current) => ({
        ...current,
        [placement]: true,
      }));
    },
    [],
  );

  const onEnableHero = useCallback(
    async (placement: ReadingReminderHeroPlacement) => {
      logClick(getReadingReminderCtaParams(placement));
      await onEnable();
      setPlacementDismissed(placement);
    },
    [logClick, onEnable, setPlacementDismissed],
  );

  const onDismissHero = useCallback(
    async (placement: ReadingReminderHeroPlacement) => {
      setPlacementDismissed(placement);
      logDismiss(getReadingReminderCtaParams(placement));
      await onDismiss();
    },
    [logDismiss, onDismiss, setPlacementDismissed],
  );

  return {
    adjustedHeroInsertIndex,
    shouldShowTopHero,
    shouldShowInFeedHero,
    title,
    subtitle,
    onEnableHero,
    onDismissHero,
  };
};
