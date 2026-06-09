import { useAuthContext } from '../contexts/AuthContext';
import { useConditionalFeature } from './useConditionalFeature';
import { featureFeedCardGlassActions } from '../lib/featureManagement';

export const useFeedCardGlassActions = (): boolean => {
  const { isAuthReady } = useAuthContext();
  const { value } = useConditionalFeature({
    feature: featureFeedCardGlassActions,
    shouldEvaluate: isAuthReady,
  });
  return value;
};
