import { featureShareLeaderboard } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { useSharingVisibility } from '../useSharingVisibility';

// Gate for every leaderboard share affordance (directory cards, leaderboard
// page header, personal rank card). The per-topic flag is only evaluated once
// the sharing-visibility master switch is on, so control users never get
// bucketed into the experiment.
export const useLeaderboardShareEnabled = (shouldEvaluate = true): boolean => {
  const { isEnabled: isSharingEnabled } = useSharingVisibility(shouldEvaluate);
  const { value } = useConditionalFeature({
    feature: featureShareLeaderboard,
    shouldEvaluate: isSharingEnabled,
  });

  return isSharingEnabled && value;
};
