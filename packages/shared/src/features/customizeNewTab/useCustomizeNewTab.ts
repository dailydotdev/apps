import { useCallback, useEffect, useMemo, useState } from 'react';
import { useActions } from '../../hooks/useActions';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';
import { ActionType } from '../../graphql/actions';
import { featureNewtabCustomizer } from '../../lib/featureManagement';

export interface UseCustomizeNewTab {
  shouldRender: boolean;
  isOpen: boolean;
  open: () => void;
  close: (via: 'x' | 'esc' | 'done') => void;
  isFlagLoading: boolean;
}

// Users whose account was created within this window are considered "new"
// and get the panel opened automatically on first visit. Everyone else can
// still reach it via the collapsed rail.
export const NEW_USER_WINDOW_DAYS = 14;

export const useCustomizeNewTab = (): UseCustomizeNewTab => {
  const { user } = useAuthContext();
  const { isOnboardingComplete, isOnboardingActionsReady } =
    useOnboardingActions();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const hasDismissed = checkHasCompleted(ActionType.DismissedNewTabCustomizer);

  const shouldEvaluate = isActionsFetched && isOnboardingComplete;
  const { value: isFlagEnabled, isLoading: isFlagLoading } =
    useConditionalFeature({
      feature: featureNewtabCustomizer,
      shouldEvaluate,
    });

  const shouldRender =
    isOnboardingActionsReady && isOnboardingComplete && !!isFlagEnabled;

  const isNewUser = useMemo(() => {
    if (!user?.createdAt) {
      return false;
    }
    const createdAt = new Date(user.createdAt).getTime();
    const windowMs = NEW_USER_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - createdAt < windowMs;
  }, [user?.createdAt]);

  const [isOpen, setIsOpen] = useState(false);
  const [hasSyncedInitialOpen, setHasSyncedInitialOpen] = useState(false);

  // Auto-open once on first visit for new users who haven't dismissed yet.
  // Existing users will only see the collapsed rail until they open it.
  useEffect(() => {
    if (hasSyncedInitialOpen) {
      return;
    }
    if (!shouldRender || isFlagLoading) {
      return;
    }
    setHasSyncedInitialOpen(true);
    if (isNewUser && !hasDismissed) {
      setIsOpen(true);
    }
  }, [
    hasSyncedInitialOpen,
    shouldRender,
    isFlagLoading,
    hasDismissed,
    isNewUser,
  ]);

  const open = useCallback(() => setIsOpen(true), []);

  // via is provided by the shell so it can log a dismiss event with source;
  // the hook itself only needs to flip state and record the action once.
  const close = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (via: 'x' | 'esc' | 'done') => {
      setIsOpen(false);
      if (!hasDismissed) {
        // Fire-and-forget: the action api dedupes on the server.
        completeAction(ActionType.DismissedNewTabCustomizer);
      }
    },
    [completeAction, hasDismissed],
  );

  return {
    shouldRender,
    isOpen,
    open,
    close,
    isFlagLoading,
  };
};
