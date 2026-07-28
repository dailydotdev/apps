import { featureShareCopyMyFeed } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { useSharingVisibility } from '../useSharingVisibility';

// Gate for the "Copy my feed" affordance in the feed navigation. The per-topic
// flag is only evaluated once the sharing-visibility master switch is on, so
// control users never get bucketed into the experiment.
export const useCopyMyFeedEnabled = (shouldEvaluate = true): boolean => {
  const { isEnabled: isSharingEnabled } = useSharingVisibility(shouldEvaluate);
  const { value } = useConditionalFeature({
    feature: featureShareCopyMyFeed,
    shouldEvaluate: isSharingEnabled,
  });

  return isSharingEnabled && value;
};
