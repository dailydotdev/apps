import { useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureNewD1Experience } from '../../lib/featureManagement';

interface UseProfileCompletionIndicator {
  showIndicator: boolean;
  dismissIndicator: () => void;
}

export const useProfileCompletionIndicator =
  (): UseProfileCompletionIndicator => {
    const { user } = useAuthContext();
    const { checkHasCompleted, completeAction, isActionsFetched } =
      useActions();
    const profileCompletionPercentage =
      user?.profileCompletion?.percentage ?? 100;

    const isDismissed = checkHasCompleted(
      ActionType.DismissProfileCompletionIndicator,
    );

    const dismissIndicator = useCallback(() => {
      completeAction(ActionType.DismissProfileCompletionIndicator);
    }, [completeAction]);

    const shouldEvaluate =
      isActionsFetched && !isDismissed && profileCompletionPercentage < 100;

    const { value: isNewD1Experience } = useConditionalFeature({
      feature: featureNewD1Experience,
      shouldEvaluate,
    });

    const showIndicator = shouldEvaluate && !isNewD1Experience;

    return {
      showIndicator,
      dismissIndicator,
    };
  };
