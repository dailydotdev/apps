import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';

interface UseOnboarding {
  shouldShowAuthBanner: boolean;
  isOnboardingReady: boolean;
  hasCompletedEditTags: boolean;
  hasCompletedContentTypes: boolean;
  completeStep: (action: ActionType) => void;
}

export const useOnboarding = (): UseOnboarding => {
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const { isAuthReady, user } = useAuthContext();
  const shouldShowAuthBanner = isAuthReady && !user;

  const { hasCompletedEditTags, hasCompletedContentTypes } = useMemo(() => {
    /*
      This is the date that completing the onboarding became required.
      Anyone who created an account before this date is exempt from the requirement.
    */
    const registeredBeforeRequired =
      user?.createdAt && new Date(user.createdAt) < new Date('2025-01-08');
    return {
      hasCompletedEditTags:
        registeredBeforeRequired || checkHasCompleted(ActionType.EditTag),
      hasCompletedContentTypes:
        registeredBeforeRequired || checkHasCompleted(ActionType.ContentTypes),
    };
  }, [checkHasCompleted, user]);

  return {
    shouldShowAuthBanner,
    isOnboardingReady: isActionsFetched && isAuthReady,
    hasCompletedEditTags,
    hasCompletedContentTypes,
    completeStep: (action: ActionType) => completeAction(action),
  };
};
