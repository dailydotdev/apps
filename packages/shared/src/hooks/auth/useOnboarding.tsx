import { useCallback, useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';

interface UseOnboarding {
  shouldShowAuthBanner: boolean;
}

export const useOnboarding = (): UseOnboarding => {
  const { isAuthReady, user } = useAuthContext();
  const shouldShowAuthBanner = isAuthReady && !user;

  return { shouldShowAuthBanner };
};

interface UseOnboardingActions {
  isOnboardingActionsReady: boolean;
  hasCompletedEditTags: boolean;
  hasCompletedContentTypes: boolean;
  completeStep: (action: ActionType) => void;
}

export const useOnboardingActions = (): UseOnboardingActions => {
  const { user, isAuthReady } = useAuthContext();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const { hasCompletedEditTags, hasCompletedContentTypes } = useMemo(() => {
    /*
      This is the date that completing the onboarding became required.
      Anyone who created an account before this date is exempt from the requirement.
    */
    const registeredBeforeRequired =
      user?.createdAt && new Date(user.createdAt) < new Date('2025-01-20');
    return {
      hasCompletedEditTags:
        registeredBeforeRequired || checkHasCompleted(ActionType.EditTag),
      hasCompletedContentTypes:
        registeredBeforeRequired || checkHasCompleted(ActionType.ContentTypes),
    };
  }, [checkHasCompleted, user]);

  return {
    isOnboardingActionsReady: user && isAuthReady && isActionsFetched,
    hasCompletedEditTags,
    hasCompletedContentTypes,
    completeStep: useCallback(
      (action: ActionType) => completeAction(action),
      [completeAction],
    ),
  };
};
