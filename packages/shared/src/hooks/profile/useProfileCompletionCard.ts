import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { profileCompletionCardFeature } from '../../lib/featureManagement';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';

interface UseProfileCompletionCard {
  showProfileCompletionCard: boolean;
  isDismissed: boolean;
  isLoading: boolean;
}

interface UseProfileCompletionCardProps {
  isMyFeed: boolean;
}

export const useProfileCompletionCard = ({
  isMyFeed,
}: UseProfileCompletionCardProps): UseProfileCompletionCard => {
  const { user } = useAuthContext();
  const { checkHasCompleted, isActionsFetched } = useActions();

  const profileCompletion = user?.profileCompletion;
  const isCompleted = (profileCompletion?.percentage ?? 100) === 100;
  const isDismissed =
    isActionsFetched && checkHasCompleted(ActionType.ProfileCompletionCard);

  // Use same pattern as brief card: require isActionsFetched before evaluating
  const hasNotDismissed =
    isActionsFetched && !checkHasCompleted(ActionType.ProfileCompletionCard);
  const shouldEvaluate = isMyFeed && !isCompleted && hasNotDismissed;

  const { value: featureEnabled, isLoading: isFeatureLoading } =
    useConditionalFeature({
      feature: profileCompletionCardFeature,
      shouldEvaluate,
    });

  // We're loading if we might show the card but are still waiting for data
  const couldPotentiallyShow = isMyFeed && !isCompleted && !!profileCompletion;
  const isLoading =
    couldPotentiallyShow && (!isActionsFetched || isFeatureLoading);

  return {
    showProfileCompletionCard:
      shouldEvaluate && featureEnabled && !!profileCompletion,
    isDismissed,
    isLoading,
  };
};
