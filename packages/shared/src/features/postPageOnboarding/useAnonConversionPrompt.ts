import { useCallback, useState } from 'react';
import usePersistentContext from '../../hooks/usePersistentContext';
import { ANON_CONVERT_PROMPT_SEEN_KEY } from './common';
import { useScrollValueMoment } from './useScrollValueMoment';
import type { BuildFeedSignupOrigin } from './useBuildFeedSignup';

interface UseAnonConversionPromptProps {
  enabled: boolean;
}

interface UseAnonConversionPrompt {
  isOpen: boolean;
  reason: BuildFeedSignupOrigin | null;
  /** Open the prompt; returns true if it actually opened (intercepted). */
  openPrompt: (reason: BuildFeedSignupOrigin) => boolean;
  closePrompt: () => void;
}

/**
 * Orchestrates the single anonymous conversion surface. It opens at most once
 * (per device) at whichever high-intent moment comes first — scroll value
 * moment, exit intent, or an intercepted "read original" click — and never
 * nags again once dismissed.
 */
export const useAnonConversionPrompt = ({
  enabled,
}: UseAnonConversionPromptProps): UseAnonConversionPrompt => {
  const [seen, setSeen] = usePersistentContext<boolean>(
    ANON_CONVERT_PROMPT_SEEN_KEY,
    false,
  );
  const [state, setState] = useState<{
    isOpen: boolean;
    reason: BuildFeedSignupOrigin | null;
  }>({ isOpen: false, reason: null });

  const canShow = enabled && !seen;

  const openPrompt = useCallback(
    (reason: BuildFeedSignupOrigin): boolean => {
      if (!canShow || state.isOpen) {
        return false;
      }
      setState({ isOpen: true, reason });
      return true;
    },
    [canShow, state.isOpen],
  );

  const closePrompt = useCallback(() => {
    setState({ isOpen: false, reason: null });
    setSeen(true);
  }, [setSeen]);

  // Leave-intent only: the bottom prompt never interrupts mid-read. The
  // persistent right-side card carries the value-moment conversion instead.
  useScrollValueMoment({
    enabled: canShow,
    onExitIntent: () => openPrompt('exit_intent'),
  });

  return {
    isOpen: state.isOpen,
    reason: state.reason,
    openPrompt,
    closePrompt,
  };
};
