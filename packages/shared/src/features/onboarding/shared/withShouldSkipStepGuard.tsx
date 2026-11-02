import React, { useRef, useEffect } from 'react';
import type { FunnelStep, FunnelStepTransitionCallback } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';

export const withShouldSkipStepGuard = <Step extends FunnelStep>(
  Component: React.FC<Step>,
  useShouldSkipStep: () => { shouldSkip: boolean },
): React.FC<Step> => {
  return function GuardedStep(props: Step) {
    const { type, isActive, onRegisterStepToSkip, onTransition } =
      props as Step & { onTransition?: FunnelStepTransitionCallback };
    const transitionRef = useRef(onTransition);
    transitionRef.current = onTransition;
    const wasActiveRef = useRef(false);
    const { shouldSkip } = useShouldSkipStep();

    // Registered while rendering, not in an effect: a step that completes
    // itself in an effect (the signup wall for a logged-in user) runs before
    // the effects of the steps after it, and would read a stale skip map.
    onRegisterStepToSkip?.(type, shouldSkip);

    useEffect(() => {
      const isActivated = !!isActive && !wasActiveRef.current;
      wasActiveRef.current = !!isActive;

      if (isActivated && shouldSkip) {
        transitionRef.current?.({ type: FunnelStepTransitionType.Complete });
      }
    }, [isActive, shouldSkip]);

    if (shouldSkip) {
      return null;
    }

    return <Component {...props} />;
  };
};
