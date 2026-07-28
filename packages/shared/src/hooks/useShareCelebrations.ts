import { featureShareCelebrations } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { useSharingVisibility } from './useSharingVisibility';

// Resolves whether celebration surfaces (achievements, unlock modal, streak
// milestone) may render share/download affordances. Gated on the initiative's
// master kill-switch AND the per-topic `share_celebrations` flag, so either one
// can turn the surfaces back to their current, share-free rendering.
export const useShareCelebrations = (shouldEvaluate = true): boolean => {
  const { isEnabled } = useSharingVisibility(shouldEvaluate);
  const { value } = useConditionalFeature({
    feature: featureShareCelebrations,
    shouldEvaluate: shouldEvaluate && isEnabled,
  });

  return isEnabled && value;
};
