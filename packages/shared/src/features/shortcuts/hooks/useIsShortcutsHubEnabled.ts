import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureShortcutsHub } from '../../../lib/featureManagement';

export function useIsShortcutsHubEnabled(): boolean {
  const { user } = useAuthContext();
  const { value: hubEnabled } = useConditionalFeature({
    feature: featureShortcutsHub,
    shouldEvaluate: !!user,
  });

  return !!user && !!hubEnabled;
}
