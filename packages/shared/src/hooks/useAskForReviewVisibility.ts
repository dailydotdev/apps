import { useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useAlertsContext } from '../contexts/AlertContext';
import { useActions } from './useActions';
import { useReadingStreak } from './streaks/useReadingStreak';
import { useConditionalFeature } from './useConditionalFeature';
import { featureAskForReview } from '../lib/featureManagement';
import { ActionType } from '../graphql/actions';
import type { ReviewDestination } from '../lib/askForReview';
import {
  getReviewDestination,
  hasShownThisSession,
  isCooldownActive,
} from '../lib/askForReview';

interface UseAskForReviewVisibility {
  visible: boolean;
  destination: ReviewDestination | null;
  streakValue: number;
  variantEnabled: boolean;
  streakThreshold: number;
  cooldownDays: number;
}

export const useAskForReviewVisibility = (): UseAskForReviewVisibility => {
  const { user, isAuthReady, isLoggedIn } = useAuthContext();
  const { alerts, loadedAlerts } = useAlertsContext();
  const { checkHasCompleted, isActionsFetched } = useActions();
  const { streak, isStreaksEnabled } = useReadingStreak();

  const destination = useMemo(() => getReviewDestination(), []);
  const sessionShown = hasShownThisSession();
  const completedPermanent = checkHasCompleted(
    ActionType.AskedForReviewComplete,
  );

  const baseGate =
    isAuthReady &&
    isLoggedIn &&
    !!user?.id &&
    isActionsFetched &&
    loadedAlerts &&
    isStreaksEnabled &&
    !completedPermanent &&
    !sessionShown &&
    !alerts?.showStreakMilestone &&
    destination !== null;

  const { value: featureValue } = useConditionalFeature({
    feature: featureAskForReview,
    shouldEvaluate: baseGate,
  });

  const variantEnabled = !!featureValue?.enabled;
  const streakThreshold = featureValue?.streakThreshold ?? 3;
  const cooldownDays = featureValue?.cooldownDays ?? 14;
  const streakValue = streak?.current ?? 0;

  const visible = Boolean(
    baseGate &&
      variantEnabled &&
      streakValue >= streakThreshold &&
      !isCooldownActive(cooldownDays),
  );

  return {
    visible,
    destination,
    streakValue,
    variantEnabled,
    streakThreshold,
    cooldownDays,
  };
};
