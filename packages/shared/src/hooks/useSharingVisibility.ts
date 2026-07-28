import { featureSharingVisibility } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';

interface UseSharingVisibility {
  isEnabled: boolean;
  isLoading: boolean;
}

// Master gate for the sharing-visibility initiative. Wraps the
// `sharing_visibility` kill-switch so every surface can guard on it with one
// call. Pass `shouldEvaluate` to avoid evaluating GrowthBook until the surface
// would actually render (per repo convention).
export const useSharingVisibility = (
  shouldEvaluate = true,
): UseSharingVisibility => {
  const { value, isLoading } = useConditionalFeature({
    feature: featureSharingVisibility,
    shouldEvaluate,
  });

  return { isEnabled: shouldEvaluate && value, isLoading };
};
