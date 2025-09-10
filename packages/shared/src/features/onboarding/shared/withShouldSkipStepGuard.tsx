import React, { useRef, useEffect } from 'react';
import type { FunnelStep } from '../types/funnel';

export const withShouldSkipStepGuard = <Step extends FunnelStep>(
  Component: React.FC<Step>,
  useShouldSkipStep: () => { shouldSkip: boolean },
): React.FC<Step> => {
  return function GuardedStep(props: Step) {
    const { type, onRegisterStepToSkip } = props;
    const callbackRef = useRef(onRegisterStepToSkip);
    callbackRef.current = onRegisterStepToSkip;
    const { shouldSkip } = useShouldSkipStep();

    useEffect(() => {
      if (shouldSkip && callbackRef.current) {
        callbackRef.current(type);
      }
    }, [shouldSkip, type]);

    if (shouldSkip) {
      return null;
    }

    return <Component {...props} />;
  };
};
