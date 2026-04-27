import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useActions } from '../../hooks/useActions';
import { useAuthContext } from '../../contexts/AuthContext';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';
import { ActionType } from '../../graphql/actions';
import { useCustomizerOpenRequest } from './store/customizerOpenRequest.store';
import {
  useRightSidebarSettled,
  useSetRightSidebarSettled,
} from './store/rightSidebar.store';

export interface UseCustomizeNewTab {
  shouldRender: boolean;
  isOpen: boolean;
  /**
   * True on the auto-opened first visit for a brand-new user who hasn't
   * dismissed the customizer yet. Used to swap in a welcome hero and tweak
   * copy so this reads as onboarding, not a settings drawer.
   */
  isFirstSession: boolean;
  /**
   * Flips to `true` on the frame after the auto-open decision lands. The
   * shell (sidebar + main feed wrappers) reads this to decide whether to
   * apply slide / padding transitions: while it's `false` the panel snaps
   * into its initial open/closed position with NO transition, so a
   * first-session user never sees a slide-in or layout-shift on load.
   * Once it's `true` every subsequent open / close animates normally.
   *
   * Mirrors `rightSidebarSettledAtom`, exposed here for ergonomic access
   * by close consumers (the sidebar shell and main feed wrapper). The
   * shared atom exists so layout-dependent chrome that doesn't import the
   * customizer (e.g. `MainLayoutHeader`) can read the same signal.
   */
  hasSettledInitialOpen: boolean;
  open: () => void;
  close: () => void;
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
  const hasSettledInitialOpen = useRightSidebarSettled();
  const setRightSidebarSettled = useSetRightSidebarSettled();

  // "First session" = brand-new user who landed on their first new tab and
  // hasn't dismissed the customizer yet. The moment they close it (via Done,
  // X, Esc, or the inline "Got it" button) we complete the action and this
  // flips to false on the next render / visit.
  const isFirstSession = shouldRender && isNewUser && !hasDismissed;

  // Auto-open once on first visit for new users who haven't dismissed yet.
  // Existing users will only see the floating button until they open it.
  //
  // Uses `useLayoutEffect` so the state flip lands BEFORE the browser
  // paints — the user never sees the offscreen `translate-x-full` start
  // state. The matching settle-flag flip lives in its own effect below
  // so the rAF cleanup doesn't get cancelled when this effect re-runs
  // for `hasSyncedInitialOpen` flipping.
  useLayoutEffect(() => {
    if (hasSyncedInitialOpen || !shouldRender) {
      return;
    }
    setHasSyncedInitialOpen(true);
    if (isFirstSession) {
      setIsOpen(true);
    }
  }, [hasSyncedInitialOpen, shouldRender, isFirstSession]);

  // After the initial sync has committed (and the first paint has
  // happened with transitions disabled), flip the shared settle flag on
  // the *next* animation frame so any subsequent open/close animates
  // normally. The flag is shared via `rightSidebarSettledAtom` because
  // the panel slide, header width, feed padding and scroll-to-top
  // wrapper all read it independently.
  //
  // Lives in its own effect (instead of being inlined into the auto-open
  // layout effect) so the rAF cleanup isn't triggered when
  // `hasSyncedInitialOpen` flips — that would cancel the scheduled
  // frame and the settle flag would never flip.
  useEffect(() => {
    if (!hasSyncedInitialOpen) {
      return undefined;
    }
    if (typeof window === 'undefined') {
      // SSR fallback — there's no rAF, but there's also no animation, so
      // we can flip the settle flag synchronously.
      setRightSidebarSettled(true);
      return undefined;
    }
    const handle = window.requestAnimationFrame(() => {
      setRightSidebarSettled(true);
    });
    return () => window.cancelAnimationFrame(handle);
  }, [hasSyncedInitialOpen, setRightSidebarSettled]);

  // Reset the settle flag on unmount so the next mount (e.g. logging out
  // and back in, or hot-reloading in dev) gets a clean run through the
  // initial-paint flow instead of inheriting `true` from the previous
  // session and animating in from the start.
  useEffect(() => {
    return () => setRightSidebarSettled(false);
  }, [setRightSidebarSettled]);

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

  // The shell logs a dismiss event with the close source ("x" / "esc" /
  // "done"); the hook itself only needs to flip state and record the action
  // once so future visits don't auto-open.
  const close = useCallback(() => {
    setIsOpen(false);
    if (!hasDismissed) {
      // Fire-and-forget: the action api dedupes on the server.
      completeAction(ActionType.DismissedNewTabCustomizer);
    }
  }, [completeAction, hasDismissed]);

  return {
    shouldRender,
    isOpen,
    isFirstSession,
    hasSettledInitialOpen,
    open,
    close,
  };
};
