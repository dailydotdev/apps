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
  getDestinationById,
  getQAOverride,
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
  isCompletedPermanent: boolean;
  isCooldownLive: boolean;
  isSessionShown: boolean;
  isStreaksEnabled: boolean;
  platformDestination: ReviewDestination | null;
}

export const useAskForReviewVisibility = (): UseAskForReviewVisibility => {
  const { user, isAuthReady, isLoggedIn } = useAuthContext();
  const { alerts, loadedAlerts } = useAlertsContext();
  const { checkHasCompleted, isActionsFetched } = useActions();
  const { streak, isStreaksEnabled } = useReadingStreak();

  const qa = useMemo(() => getQAOverride(), []);
  const platformDestination = useMemo(() => getReviewDestination(), []);
  const destination = qa?.destinationId
    ? getDestinationById(qa.destinationId)
    : platformDestination;
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
    (qa?.ignoreCompletedAction || !completedPermanent) &&
    (qa?.ignoreSession || !sessionShown) &&
    !alerts?.showStreakMilestone &&
    destination !== null;

  const { value: featureValue } = useConditionalFeature({
    feature: featureAskForReview,
    shouldEvaluate: baseGate,
  });

  const variantEnabled = !!featureValue?.enabled || !!qa;
  const streakThreshold = featureValue?.streakThreshold ?? 3;
  const cooldownDays = featureValue?.cooldownDays ?? 14;
  const streakValue = streak?.current ?? 0;
  const streakPasses = qa?.ignoreStreak || streakValue >= streakThreshold;
  const cooldownPasses = qa?.ignoreCooldown || !isCooldownActive(cooldownDays);

  const visible = Boolean(
    baseGate && variantEnabled && streakPasses && cooldownPasses,
  );

  return {
    visible,
    destination,
    streakValue,
    variantEnabled,
    streakThreshold,
    cooldownDays,
    isCompletedPermanent: completedPermanent,
    isCooldownLive: isCooldownActive(cooldownDays),
    isSessionShown: sessionShown,
    isStreaksEnabled: !!isStreaksEnabled,
    platformDestination,
  };
};
