import { featureSharePostPage } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { useSharingVisibility } from './useSharingVisibility';

// Per-topic gate for the post page/modal sharing treatments (TL;DR copy, the
// team share strip, the redesigned recommend module). Stacked on top of the
// `sharing_visibility` master kill-switch so the topic flag is only evaluated
// once the initiative itself is on.
export const useSharePostPage = (shouldEvaluate = true): boolean => {
  const { isEnabled: isInitiativeEnabled } =
    useSharingVisibility(shouldEvaluate);
  const { value } = useConditionalFeature({
    feature: featureSharePostPage,
    shouldEvaluate: shouldEvaluate && isInitiativeEnabled,
  });

  return shouldEvaluate && isInitiativeEnabled && value;
};
