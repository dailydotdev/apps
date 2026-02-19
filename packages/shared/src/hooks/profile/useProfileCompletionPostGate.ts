import { useAuthContext } from '../../contexts/AuthContext';
import { featureProfileCompletionPostGate } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';

type UseProfileCompletionPostGate = {
  isBlocked: boolean;
  isProfileComplete: boolean;
  isGateEnabled: boolean;
};

export const useProfileCompletionPostGate =
  (): UseProfileCompletionPostGate => {
    const { user } = useAuthContext();

    const { value: isGateEnabled } = useConditionalFeature({
      feature: featureProfileCompletionPostGate,
      shouldEvaluate: !!user,
    });

    const isProfileComplete =
      (user?.profileCompletion?.percentage ?? 100) >= 100;
    const isBlocked = !!isGateEnabled && !isProfileComplete;

    return {
      isBlocked,
      isProfileComplete,
      isGateEnabled: !!isGateEnabled,
    };
  };
