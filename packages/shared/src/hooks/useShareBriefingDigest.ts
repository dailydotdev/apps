import { featureShareBriefingDigest } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { useSharingVisibility } from './useSharingVisibility';

// Per-topic gate for the briefing/digest sharing surfaces. Requires the master
// `sharing_visibility` kill-switch to be on as well, so the initiative can be
// disabled wholesale without touching this flag.
export const useShareBriefingDigest = (shouldEvaluate = true): boolean => {
  const { isEnabled: isSharingVisible } = useSharingVisibility(shouldEvaluate);
  const { value } = useConditionalFeature({
    feature: featureShareBriefingDigest,
    shouldEvaluate: shouldEvaluate && isSharingVisible,
  });

  return isSharingVisible && value;
};
