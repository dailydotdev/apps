import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureSmartComposer } from '../../lib/featureManagement';

export const useSmartComposer = (): boolean => {
  const { user, isAuthReady } = useAuthContext();
  const { value } = useConditionalFeature({
    feature: featureSmartComposer,
    shouldEvaluate: isAuthReady && !!user,
  });
  return !!value;
};
