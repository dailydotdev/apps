import { useAuthContext } from '../../contexts/AuthContext';
import { useFeature } from '../../components/GrowthBookProvider';
import { featureProfileCompletionIndicator } from '../../lib/featureManagement';

interface UseProfileCompletionIndicator {
  showIndicator: boolean;
}

export const useProfileCompletionIndicator =
  (): UseProfileCompletionIndicator => {
    const { user } = useAuthContext();
    const profileCompletionPercentage =
      user?.profileCompletion?.percentage ?? 100;
    const profileCompletionThreshold = useFeature(
      featureProfileCompletionIndicator,
    );

    return {
      showIndicator: profileCompletionPercentage < profileCompletionThreshold,
    };
  };
