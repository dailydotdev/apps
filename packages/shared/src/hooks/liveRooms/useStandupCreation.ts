import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureStandupCreation } from '../../lib/featureManagement';

export const useStandupCreation = (): boolean => {
  const { user, isAuthReady } = useAuthContext();
  const { value } = useConditionalFeature({
    feature: featureStandupCreation,
    shouldEvaluate: isAuthReady && !!user,
  });
  return !!value;
};
