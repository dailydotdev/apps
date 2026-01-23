import { useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';

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

    const showIndicator =
      isActionsFetched && !isDismissed && profileCompletionPercentage < 100;

    return {
      showIndicator,
      dismissIndicator,
    };
  };
