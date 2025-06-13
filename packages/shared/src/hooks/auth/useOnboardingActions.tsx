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

export const onboardingCompletedActions = {
  funnel: [ActionType.CompletedOnboarding],
  old: [ActionType.EditTag, ActionType.ContentTypes],
} as const;

export const DATE_SINCE_ACTIONS_REQUIRED = new Date('2025-01-20');

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

  const isOnboardingComplete = useMemo(
    () =>
      registeredBeforeRequired ||
      (isActionsFetched &&
        Object.values(onboardingCompletedActions).some((actions) =>
          actions.every((action) => checkHasCompleted(action)),
        )),
    [registeredBeforeRequired, isActionsFetched, checkHasCompleted],
  );

  return {
    shouldShowAuthBanner,
    isOnboardingActionsReady: isActionsFetched && isAuthReady,
    isOnboardingComplete,
    completeStep: (action: ActionType) => completeAction(action),
  };
};
