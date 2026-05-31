import { useAuthContext } from '../../contexts/AuthContext';
import { featureAnonymousPostExperience } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';

interface UseAnonymousPostExperience {
  isAnonPostExperience: boolean;
  isLoading: boolean;
}

export const useAnonymousPostExperience = (): UseAnonymousPostExperience => {
  const { isAuthReady, user } = useAuthContext();
  const shouldEvaluate = isAuthReady && !user;
  const { value: isEnabled, isLoading } = useConditionalFeature({
    feature: featureAnonymousPostExperience,
    shouldEvaluate,
  });

  return {
    isAnonPostExperience: shouldEvaluate && isEnabled,
    isLoading,
  };
};
