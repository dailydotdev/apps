import { featureShareCopyIcon } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';

// Resolves whether copy-link actions should render the new `CopyIcon` instead
// of the legacy `LinkIcon`. Gated so the core-icon swap ramps behind
// `share_copy_icon` (control = false = existing `LinkIcon`, no metric impact).
export const useShareCopyIcon = (shouldEvaluate = true): boolean => {
  const { value } = useConditionalFeature({
    feature: featureShareCopyIcon,
    shouldEvaluate,
  });

  return value;
};
