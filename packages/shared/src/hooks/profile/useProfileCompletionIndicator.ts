import { useAuthContext } from '../../contexts/AuthContext';
import { useFeature } from '../../components/GrowthBookProvider';
import { featureProfileCompletionIndicator } from '../../lib/featureManagement';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';

interface UseProfileCompletionIndicator {
  showIndicator: boolean;
}

export const useProfileCompletionIndicator =
  (): UseProfileCompletionIndicator => {
    const { user } = useAuthContext();
    const { checkHasCompleted, isActionsFetched } = useActions();
    const profileCompletionPercentage =
      user?.profileCompletion?.percentage ?? 100;
    const profileCompletionThreshold = useFeature(
      featureProfileCompletionIndicator,
    );
    const isDismissed =
      isActionsFetched && checkHasCompleted(ActionType.ProfileCompletionCard);

    return {
      showIndicator:
        profileCompletionPercentage < profileCompletionThreshold &&
        !isDismissed,
    };
  };
