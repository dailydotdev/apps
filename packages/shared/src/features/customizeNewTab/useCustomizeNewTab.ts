import { useCallback, useEffect, useState } from 'react';
import { useActions } from '../../hooks/useActions';
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

export const useCustomizeNewTab = (): UseCustomizeNewTab => {
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

  const [isOpen, setIsOpen] = useState(false);
  const [hasSyncedInitialOpen, setHasSyncedInitialOpen] = useState(false);

  // Auto-open once for users who haven't dismissed yet. We run this only after
  // both actions and flag have resolved so we don't flash the panel.
  useEffect(() => {
    if (hasSyncedInitialOpen) {
      return;
    }
    if (!shouldRender || isFlagLoading) {
      return;
    }
    setHasSyncedInitialOpen(true);
    if (!hasDismissed) {
      setIsOpen(true);
    }
  }, [hasSyncedInitialOpen, shouldRender, isFlagLoading, hasDismissed]);

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
