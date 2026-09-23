import React, { useRef, useEffect } from 'react';
import type { FunnelStep } from '../types/funnel';

export const withShouldSkipStepGuard = <Step extends FunnelStep>(
  Component: React.FC<Step>,
  // Takes the step so a guard can read its Freyja parameters.
  useShouldSkipStep: (props: Step) => { shouldSkip: boolean },
): React.FC<Step> => {
  return function GuardedStep(props: Step) {
    const { type, onRegisterStepToSkip } = props;
    const callbackRef = useRef(onRegisterStepToSkip);
    callbackRef.current = onRegisterStepToSkip;
    const { shouldSkip } = useShouldSkipStep(props);

    useEffect(() => {
      if (callbackRef.current) {
        callbackRef.current(type, shouldSkip);
      }
    }, [shouldSkip, type]);

    if (shouldSkip) {
      return null;
    }

    return <Component {...props} />;
  };
};

/**
 * Freezes a guard's answer the first time its step is shown. Until then it
 * tracks the live value, so the funnel can skip over the step; afterwards the
 * user's own answer on the step can no longer hide it mid-transition.
 */
export const useDecidedOnArrival = (
  isActive: boolean | undefined,
  shouldSkip: boolean,
): boolean => {
  const decisionRef = useRef<boolean>();

  if (isActive && decisionRef.current === undefined) {
    decisionRef.current = shouldSkip;
  }

  return decisionRef.current ?? shouldSkip;
};
