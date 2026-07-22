import { featureShareSquadDirectory } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { useSharingVisibility } from '../useSharingVisibility';

// Gate for the copy-link/share control on the squad directory cards. The
// per-topic flag is only evaluated once the sharing-visibility master switch
// is on, so control users never get bucketed into the experiment.
export const useSquadDirectoryShareEnabled = (): boolean => {
  const { isEnabled: isSharingEnabled } = useSharingVisibility();
  const { value } = useConditionalFeature({
    feature: featureShareSquadDirectory,
    shouldEvaluate: isSharingEnabled,
  });

  return isSharingEnabled && value;
};
