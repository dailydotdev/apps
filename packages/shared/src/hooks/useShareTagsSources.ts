import { featureShareTagsSources } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { useSharingVisibility } from './useSharingVisibility';

// Resolves whether the tag/source pages should surface share as a visible
// control next to Follow. Gated by the initiative-wide `sharing_visibility`
// kill-switch first, so the per-topic flag is only evaluated when the master
// switch is on (and only when the surface would actually render it).
export const useShareTagsSources = (shouldEvaluate = true): boolean => {
  const { isEnabled: isSharingVisible } = useSharingVisibility(shouldEvaluate);
  const { value } = useConditionalFeature({
    feature: featureShareTagsSources,
    shouldEvaluate: shouldEvaluate && isSharingVisible,
  });

  return isSharingVisible && value;
};
