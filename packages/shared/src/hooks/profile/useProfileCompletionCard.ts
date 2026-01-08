import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { profileCompletionCardFeature } from '../../lib/featureManagement';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';

interface UseProfileCompletionCard {
  showProfileCompletionCard: boolean;
  isDismissed: boolean;
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

  const shouldEvaluate = isMyFeed && !isCompleted && !isDismissed;

  const { value: featureEnabled } = useConditionalFeature({
    feature: profileCompletionCardFeature,
    shouldEvaluate,
  });

  return {
    showProfileCompletionCard:
      shouldEvaluate && featureEnabled && !!profileCompletion,
    isDismissed,
  };
};
