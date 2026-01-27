import { useConditionalFeature } from '../useConditionalFeature';
import { profileCompletionCardFeature } from '../../lib/featureManagement';
import { useActions } from '../useActions';
import { useProfileCompletionIndicator } from './useProfileCompletionIndicator';

interface UseProfileCompletionCard {
  showProfileCompletionCard: boolean;
  isLoading: boolean;
}

interface UseProfileCompletionCardProps {
  isMyFeed: boolean;
}

export const useProfileCompletionCard = ({
  isMyFeed,
}: UseProfileCompletionCardProps): UseProfileCompletionCard => {
  const { isActionsFetched } = useActions();
  const { showIndicator: showProfileCompletion } =
    useProfileCompletionIndicator();

  const isCompleted = !showProfileCompletion;

  const shouldEvaluate = isMyFeed && !isCompleted;

  const { value: featureEnabled, isLoading: isFeatureLoading } =
    useConditionalFeature({
      feature: profileCompletionCardFeature,
      shouldEvaluate,
    });

  const couldPotentiallyShow = isMyFeed && !isCompleted;
  const isLoading =
    couldPotentiallyShow && (!isActionsFetched || isFeatureLoading);

  return {
    showProfileCompletionCard: shouldEvaluate && featureEnabled,
    isLoading,
  };
};
