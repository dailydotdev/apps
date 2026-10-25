import { useAuthContext } from '../contexts/AuthContext';
import { useConditionalFeature } from './useConditionalFeature';
import { featureCompanionTopCard } from '../lib/featureManagement';

// The companion permission card above the extension's feed, and the
// "Enable the companion" row in the rail's Support menu, ship behind the
// same kind of flag as the shortcuts card beside it (`useIsShortcutsHubEnabled`):
// evaluated for signed-in users only, off until the flag says otherwise.
export function useIsCompanionCardEnabled(): boolean {
  const { user } = useAuthContext();
  const { value: isEnabled } = useConditionalFeature({
    feature: featureCompanionTopCard,
    shouldEvaluate: !!user,
  });

  return !!user && !!isEnabled;
}
