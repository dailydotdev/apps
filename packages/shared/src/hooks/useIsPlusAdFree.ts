import { featureForceAd } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { usePlusSubscription } from './usePlusSubscription';

/**
 * Whether Plus keeps ads away from the reader. `force_ad` overrides it, so a
 * Plus member (the team, by default) sees ads wherever a free reader would.
 * Until the flag resolves, Plus stays ad-free.
 */
export const useIsPlusAdFree = (): boolean => {
  const { isPlus } = usePlusSubscription();
  const { value: forceAd } = useConditionalFeature({
    feature: featureForceAd,
    shouldEvaluate: isPlus,
  });

  return isPlus && !forceAd;
};
