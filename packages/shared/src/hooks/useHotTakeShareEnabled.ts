import { featureShareHotTakes } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { useSharingVisibility } from './useSharingVisibility';

// Gate for every hot-take share affordance (profile list items and header, the
// Hot & Cold modal card, the popular hot takes leaderboard). The per-topic flag
// is only evaluated once the sharing-visibility master switch is on, so control
// users never get bucketed into the experiment.
export const useHotTakeShareEnabled = (shouldEvaluate = true): boolean => {
  const { isEnabled: isSharingEnabled } = useSharingVisibility(shouldEvaluate);
  const { value } = useConditionalFeature({
    feature: featureShareHotTakes,
    shouldEvaluate: isSharingEnabled,
  });

  return isSharingEnabled && value;
};
