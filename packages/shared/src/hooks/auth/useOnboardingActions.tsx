import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';

interface UseOnboarding {
  shouldShowAuthBanner: boolean;
  isOnboardingActionsReady: boolean;
  isOnboardingComplete: boolean;
  completeStep: (action: ActionType) => void;
}

const DATE_SINCE_ACTIONS_REQUIRED = new Date('2025-01-20');

export const useOnboardingActions = (): UseOnboarding => {
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const { isAuthReady, user } = useAuthContext();
  const shouldShowAuthBanner = isAuthReady && !user;

  /*
    This is the date that completing the onboarding became required.
    Anyone who created an account before this date is exempt from the requirement.
  */
  const registeredBeforeRequired = useMemo(
    () =>
      user?.createdAt && new Date(user.createdAt) < DATE_SINCE_ACTIONS_REQUIRED,
    [user?.createdAt],
  );

  const {
    hasCompletedEditTags,
    hasCompletedContentTypes,
    hasCompletedOnboarding,
  } = useMemo(() => {
    return {
      hasCompletedEditTags: checkHasCompleted(ActionType.EditTag),
      hasCompletedContentTypes: checkHasCompleted(ActionType.ContentTypes),
      hasCompletedOnboarding: checkHasCompleted(ActionType.CompletedOnboarding),
    };
  }, [checkHasCompleted]);

  const isOnboardingComplete = useMemo(
    () =>
      registeredBeforeRequired ||
      (hasCompletedEditTags && hasCompletedContentTypes) ||
      hasCompletedOnboarding,
    [
      registeredBeforeRequired,
      hasCompletedEditTags,
      hasCompletedContentTypes,
      hasCompletedOnboarding,
    ],
  );

  return {
    shouldShowAuthBanner,
    isOnboardingActionsReady: isActionsFetched && isAuthReady,
    isOnboardingComplete,
    completeStep: (action: ActionType) => completeAction(action),
  };
};
