import React, { useRef, useEffect } from 'react';
import type { FunnelStep, FunnelStepShouldSkip } from '../types/funnel';

export const withShouldSkipStepGuard = <Step extends FunnelStep>(
  Component: React.FC<Step>,
  useShouldSkipStep: () => { shouldSkip: FunnelStepShouldSkip },
): React.FC<Step> => {
  return function GuardedStep(props: Step) {
    const { type, isActive, onRegisterStepToSkip } = props;
    const callbackRef = useRef(onRegisterStepToSkip);
    callbackRef.current = onRegisterStepToSkip;
    const { shouldSkip } = useShouldSkipStep();

    useEffect(() => {
      if (callbackRef.current) {
        callbackRef.current(type, shouldSkip);
      }
    }, [shouldSkip, type]);

    // A resolver is only consulted for the active step: every step is mounted
    // from the first screen on, and resolving it there would defeat its point.
    const isSkipped =
      typeof shouldSkip === 'function'
        ? !!isActive && shouldSkip()
        : shouldSkip;

    if (isSkipped) {
      return null;
    }

    return <Component {...props} />;
  };
};
