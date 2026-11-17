import { useEffect, useRef, useState } from 'react';
import { featureAppStoreReview } from '../lib/featureManagement';
import { iOSSupportsReview } from '../lib/ios';
import {
  appStoreReviewCooldownMs,
  streakReviewMinDays,
} from '../components/appStoreReview/common';
import { useConditionalFeature } from './useConditionalFeature';
import usePersistentContext, {
  PersistentContextKeys,
} from './usePersistentContext';

interface ReviewPrompt {
  lastAskedAt: string;
}

export const useStreakReviewAsk = (currentStreak: number): boolean => {
  const [canReview, setCanReview] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const hasDecided = useRef(false);
  const isMilestone = currentStreak >= streakReviewMinDays;
  const { value: isEnabled, isLoading } = useConditionalFeature({
    feature: featureAppStoreReview,
    shouldEvaluate: canReview && isMilestone,
  });
  const [reviewPrompt, setReviewPrompt, isFetched] =
    usePersistentContext<ReviewPrompt>(PersistentContextKeys.ReviewPrompt);

  useEffect(() => {
    setCanReview(iOSSupportsReview());
  }, []);

  useEffect(() => {
    if (
      hasDecided.current ||
      !canReview ||
      !isMilestone ||
      isLoading ||
      !isFetched
    ) {
      return;
    }

    hasDecided.current = true;
    const lastAskedAt = reviewPrompt?.lastAskedAt
      ? new Date(reviewPrompt.lastAskedAt).getTime()
      : 0;

    if (!isEnabled || Date.now() - lastAskedAt < appStoreReviewCooldownMs) {
      return;
    }

    setIsVisible(true);
    setReviewPrompt({ lastAskedAt: new Date().toISOString() }).catch(
      () => null,
    );
  }, [
    canReview,
    isEnabled,
    isFetched,
    isLoading,
    isMilestone,
    reviewPrompt,
    setReviewPrompt,
  ]);

  return isVisible;
};
