import { useAuthContext } from '../../contexts/AuthContext';
import { featureProfileCompletionPostGate } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';

type UseProfileCompletionPostGate = {
  isBlocked: boolean;
  isProfileComplete: boolean;
  isGateEnabled: boolean;
  requiredPercentage: number;
};

export const useProfileCompletionPostGate =
  (): UseProfileCompletionPostGate => {
    const { user } = useAuthContext();

    const { value: gateValue } = useConditionalFeature({
      feature: featureProfileCompletionPostGate,
      shouldEvaluate: !!user,
    });

    let requiredPercentage = 0;
    if (gateValue === true) {
      requiredPercentage = 100;
    } else if (
      typeof gateValue === 'number' &&
      gateValue > 0 &&
      gateValue <= 100
    ) {
      requiredPercentage = gateValue;
    }
    const isGateEnabled = requiredPercentage > 0;
    const profileCompletionPercentage =
      user?.profileCompletion?.percentage ?? 100;
    const isProfileComplete = profileCompletionPercentage >= requiredPercentage;
    const isBlocked = isGateEnabled && !isProfileComplete;

    return {
      isBlocked,
      isProfileComplete,
      isGateEnabled,
      requiredPercentage,
    };
  };
