import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useActions } from '../../hooks/useActions';
import { useAuthContext } from '../../contexts/AuthContext';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';
import { ActionType } from '../../graphql/actions';
import { useFirstSessionOverride } from './store/firstSessionOverride.store';
import { useCustomizerOpenRequest } from './store/customizerOpenRequest.store';

export interface UseCustomizeNewTab {
  shouldRender: boolean;
  isOpen: boolean;
  /**
   * True on the auto-opened first visit for a brand-new user who hasn't
   * dismissed the customizer yet. Used to swap in a welcome hero and tweak
   * copy so this reads as onboarding, not a settings drawer.
   *
   * Reflects the dev override when one is set; otherwise mirrors
   * `realIsFirstSession`.
   */
  isFirstSession: boolean;
  /**
   * The unmodified first-session signal, ignoring any dev override. Surface
   * to UIs (e.g. the dev toggle pill) that need to display the real status.
   */
  realIsFirstSession: boolean;
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

  // "First session" = brand-new user who landed on their first new tab and
  // hasn't dismissed the customizer yet. The moment they close it (via Done,
  // X, Esc, or the inline "Got it" button) we complete the action and this
  // flips to false on the next render / visit.
  const realIsFirstSession = shouldRender && isNewUser && !hasDismissed;

  // Dev override is read regardless of NODE_ENV (the store is harmless on
  // its own); the only place that *writes* to it is the dev toggle, which
  // is build-time guarded. So in production this reduces to `null ?? real`.
  const { override } = useFirstSessionOverride();
  const isFirstSession = override ?? realIsFirstSession;

  // Auto-open once on first visit for new users who haven't dismissed yet.
  // Existing users will only see the floating button until they open it.
  useEffect(() => {
    if (hasSyncedInitialOpen || !shouldRender) {
      return;
    }
    setHasSyncedInitialOpen(true);
    if (isFirstSession) {
      setIsOpen(true);
    }
  }, [hasSyncedInitialOpen, shouldRender, isFirstSession]);

  const open = useCallback(() => setIsOpen(true), []);

  // Anyone who calls `useRequestCustomizerOpen` (e.g. the profile dropdown's
  // "Customize new tab" item) bumps a counter we watch here. We only react to
  // increments past the initial mount value so freshly mounted instances
  // don't auto-open just because the atom already has a non-zero count from
  // a prior interaction in this session.
  const openRequest = useCustomizerOpenRequest();
  const lastSeenRequestRef = useRef(openRequest);
  useEffect(() => {
    if (openRequest === lastSeenRequestRef.current) {
      return;
    }
    lastSeenRequestRef.current = openRequest;
    if (!shouldRender) {
      return;
    }
    setIsOpen(true);
  }, [openRequest, shouldRender]);

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
    isFirstSession,
    realIsFirstSession,
    open,
    close,
  };
};
