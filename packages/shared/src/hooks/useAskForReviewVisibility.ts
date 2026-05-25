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

const FORCE_SHOW_QUERY_KEY = 'force-ask-for-review';

const getForceShow = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(FORCE_SHOW_QUERY_KEY) === '1';
  } catch {
    return false;
  }
};

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

  const forceShow = useMemo(() => getForceShow(), []);
  const qa = useMemo(() => getQAOverride(), []);
  const platformDestination = useMemo(() => getReviewDestination(), []);
  let destination: ReviewDestination | null;
  if (qa?.destinationId) {
    destination = getDestinationById(qa.destinationId);
  } else if (platformDestination) {
    destination = platformDestination;
  } else if (forceShow) {
    destination = getDestinationById('chrome_web_store');
  } else {
    destination = null;
  }
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

  const visible =
    forceShow ||
    Boolean(baseGate && variantEnabled && streakPasses && cooldownPasses);

  return {
    visible,
    destination,
    streakValue: forceShow && streakValue === 0 ? 3 : streakValue,
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
