import { useCallback, useEffect, useMemo, useState } from 'react';
import { useActions } from '../../hooks/useActions';
import { useAuthContext } from '../../contexts/AuthContext';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';
import { ActionType } from '../../graphql/actions';

export interface UseCustomizeNewTab {
  shouldRender: boolean;
  isOpen: boolean;
  /**
   * True on the auto-opened first visit for a brand-new user who hasn't
   * dismissed the customizer yet. Used to swap in a welcome hero and tweak
   * copy so this reads as onboarding, not a settings drawer.
   */
  isFirstSession: boolean;
  open: () => void;
  close: (via: 'x' | 'esc' | 'done') => void;
}

// Users whose account was created within this window are considered "new"
// and get the panel opened automatically on first visit. Everyone else can
// still reach it via the floating Customize button.
export const NEW_USER_WINDOW_DAYS = 14;

export const useCustomizeNewTab = (): UseCustomizeNewTab => {
  const { user } = useAuthContext();
  const { isOnboardingComplete, isOnboardingActionsReady } =
    useOnboardingActions();
  const { checkHasCompleted, completeAction } = useActions();
  const hasDismissed = checkHasCompleted(ActionType.DismissedNewTabCustomizer);

  // The button is visible to any logged-in user who has finished onboarding.
  // Gating further (e.g. on a feature flag) would hide it from everyone by
  // default, which isn't what we want.
  const shouldRender = isOnboardingActionsReady && isOnboardingComplete;

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
  // Existing users will only see the floating button until they open it.
  useEffect(() => {
    if (hasSyncedInitialOpen || !shouldRender) {
      return;
    }
    setHasSyncedInitialOpen(true);
    if (isNewUser && !hasDismissed) {
      setIsOpen(true);
    }
  }, [hasSyncedInitialOpen, shouldRender, hasDismissed, isNewUser]);

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

  // "First session" = brand-new user who landed on their first new tab and
  // hasn't dismissed the customizer yet. The moment they close it (via Done,
  // X, Esc, or the inline "Got it" button) we complete the action and this
  // flips to false on the next render / visit.
  const isFirstSession = shouldRender && isNewUser && !hasDismissed;

  return {
    shouldRender,
    isOpen,
    isFirstSession,
    open,
    close,
  };
};
