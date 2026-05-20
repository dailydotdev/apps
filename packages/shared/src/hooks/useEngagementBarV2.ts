import { useAuthContext } from '../contexts/AuthContext';
import { useConditionalFeature } from './useConditionalFeature';
import { featureEngagementBarV2 } from '../lib/featureManagement';

export const useEngagementBarV2 = (): boolean => {
  const { isAuthReady, user } = useAuthContext();
  const { value } = useConditionalFeature({
    feature: featureEngagementBarV2,
    shouldEvaluate: isAuthReady && !!user,
  });
  return value;
};
