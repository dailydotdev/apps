import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../../hooks/useActions';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';
import { ActionType } from '../../graphql/actions';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureNewTabCustomizer } from '../../lib/featureManagement';
import { checkIsExtension } from '../../lib/func';

export const CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX = 360;

export type CustomizeNewTabContextValue = {
  isEnabled: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  reset: () => void;
  isFirstSession: boolean;
};

const NOOP = () => undefined;

const DEFAULT_VALUE: CustomizeNewTabContextValue = {
  isEnabled: false,
  isOpen: false,
  open: NOOP,
  close: NOOP,
  reset: NOOP,
  isFirstSession: false,
};

const CustomizeNewTabContext =
  createContext<CustomizeNewTabContextValue>(DEFAULT_VALUE);

type ProviderProps = {
  children: ReactNode;
};

const useEscapeToClose = (isOpen: boolean, close: () => void): void => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);
};

// The customizer evaluates a GrowthBook flag, but only when the user is
// otherwise eligible (extension build, authenticated, onboarded, actions
// loaded). This matches the `useConditionalFeature` shouldEvaluate guidance
// in `apps/AGENTS.md` so we don't burn flag evaluations on users who could
// never see the panel anyway.
const isCustomizerEligible = ({
  isAuthReady,
  isExtension,
  isOnboardingComplete,
  isActionsFetched,
}: {
  isAuthReady: boolean;
  isExtension: boolean;
  isOnboardingComplete: boolean;
  isActionsFetched: boolean;
}): boolean =>
  isExtension && isAuthReady && isActionsFetched && isOnboardingComplete;

export const CustomizeNewTabProvider = ({
  children,
}: ProviderProps): ReactElement => {
  const isExtension = checkIsExtension();
  const { isAuthReady } = useAuthContext();
  const { isActionsFetched, checkHasCompleted, completeAction } = useActions();
  const { isOnboardingComplete } = useOnboardingActions();
  const { updateFlag } = useSettingsContext();

  const isEligible = isCustomizerEligible({
    isAuthReady,
    isExtension,
    isOnboardingComplete,
    isActionsFetched,
  });

  const { value: isFlagOn } = useConditionalFeature({
    feature: featureNewTabCustomizer,
    shouldEvaluate: isEligible,
  });
  const isEnabled = isEligible && isFlagOn;

  // Two independent action gates so dismiss / welcome behave intuitively:
  //
  //   - `DismissedNewTabCustomizer` controls AUTO-OPEN on first new tab
  //     visit. Once the user closes the panel for the first time we set
  //     this and never auto-open again.
  //
  //   - `SeenKeepItOverlay` controls the WELCOME HERO inside the panel.
  //     Until we record that the user has actually seen the welcome card,
  //     reopening the panel keeps showing the hero — so a returning
  //     first-time user who clicks Customize from the profile menu still
  //     gets the colorful onboarding moment.
  const hasDismissed = checkHasCompleted(ActionType.DismissedNewTabCustomizer);
  const hasSeenWelcome = checkHasCompleted(ActionType.SeenKeepItOverlay);
  const isFirstSession = isEnabled && !hasSeenWelcome;

  const [isOpen, setIsOpen] = useState(false);
  const dismissedRef = useRef(false);
  const seenWelcomeRef = useRef(false);
  const autoOpenedRef = useRef(false);

  // Auto-open on the first new tab visit: once actions have resolved and
  // the user hasn't dismissed the panel, pop it open exactly once.
  useEffect(() => {
    if (!isEnabled || autoOpenedRef.current) {
      return;
    }
    if (!hasDismissed) {
      autoOpenedRef.current = true;
      setIsOpen(true);
    }
  }, [isEnabled, hasDismissed]);

  const markDismissedOnce = useCallback(() => {
    if (dismissedRef.current) {
      return;
    }
    dismissedRef.current = true;
    completeAction(ActionType.DismissedNewTabCustomizer).catch(() => {
      // Failed to persist — let the user see it again rather than silently
      // suppressing.
      dismissedRef.current = false;
    });
  }, [completeAction]);

  const markWelcomeSeenOnce = useCallback(() => {
    if (seenWelcomeRef.current || hasSeenWelcome) {
      return;
    }
    seenWelcomeRef.current = true;
    completeAction(ActionType.SeenKeepItOverlay).catch(() => {
      seenWelcomeRef.current = false;
    });
  }, [completeAction, hasSeenWelcome]);

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => {
    // Record both gates: dismissal (skip auto-open next visit) and welcome
    // seen (don't replay the hero on reopen). Marking welcome on every
    // close path — X, Esc, Done — keeps Escape from leaving an
    // un-acknowledged welcome card lurking for the next session.
    setIsOpen(false);
    markDismissedOnce();
    if (isFirstSession) {
      markWelcomeSeenOnce();
    }
  }, [markDismissedOnce, markWelcomeSeenOnce, isFirstSession]);

  const reset = useCallback(() => {
    updateFlag('newTabMode', 'discover');
    updateFlag('focusSchedule', { pauseUntil: null, windows: {} });
  }, [updateFlag]);

  useEscapeToClose(isOpen, close);

  const value = useMemo<CustomizeNewTabContextValue>(
    () => ({
      isEnabled,
      isOpen: isEnabled && isOpen,
      open,
      close,
      reset,
      isFirstSession,
    }),
    [isEnabled, isOpen, open, close, reset, isFirstSession],
  );

  return (
    <CustomizeNewTabContext.Provider value={value}>
      {children}
    </CustomizeNewTabContext.Provider>
  );
};

export const useCustomizeNewTab = (): CustomizeNewTabContextValue =>
  useContext(CustomizeNewTabContext);
