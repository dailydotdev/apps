import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureSnapshotShare } from '../../lib/featureManagement';

/**
 * Gates the Snapshot control. `shouldEvaluate` keeps a viewer out of the
 * experiment until the surface carrying the control would actually render.
 */
export const useSnapshotShare = (shouldEvaluate = true): boolean => {
  const { value } = useConditionalFeature({
    feature: featureSnapshotShare,
    shouldEvaluate,
  });

  return value;
};
