import { featureShareDiscovery } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { useSharingVisibility } from './useSharingVisibility';

interface UseShareDiscovery {
  isEnabled: boolean;
}

// Per-topic gate for the discovery-surfaces share affordances (Explore feed
// headers + best-of archive pages). Both the `sharing_visibility` master
// kill-switch AND `share_discovery` must be on; the per-topic flag is only
// evaluated once the master gate passes so GrowthBook exposure stays clean.
export const useShareDiscovery = (shouldEvaluate = true): UseShareDiscovery => {
  const { isEnabled: isSharingEnabled } = useSharingVisibility(shouldEvaluate);
  const { value } = useConditionalFeature({
    feature: featureShareDiscovery,
    shouldEvaluate: shouldEvaluate && isSharingEnabled,
  });

  return { isEnabled: isSharingEnabled && value };
};
