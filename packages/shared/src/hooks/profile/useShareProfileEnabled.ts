import { featureShareProfile } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { useSharingVisibility } from '../useSharingVisibility';

// Gate for the profile share affordance. It has to pass both the per-topic
// `share_profile` flag and the initiative-wide `sharing_visibility`
// kill-switch, and every profile surface needs the same answer, so the pair is
// resolved in one place. The per-topic flag is only evaluated once the master
// passes, so control users never get bucketed into the experiment.
export const useShareProfileEnabled = (shouldEvaluate = true): boolean => {
  const { isEnabled: isSharingVisible } = useSharingVisibility(shouldEvaluate);
  const { value } = useConditionalFeature({
    feature: featureShareProfile,
    shouldEvaluate: shouldEvaluate && isSharingVisible,
  });

  return isSharingVisible && value;
};
