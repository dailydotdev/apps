import React from 'react';
import type { FunnelStep } from '../types/funnel';

export const withIsActiveGuard = <Step extends FunnelStep>(
  Component: React.FC<Step>,
): React.FC<Step> => {
  return function GuardedStep(props: Step) {
    const { isActive } = props;
    if (!isActive) {
      return null;
    }
    return <Component {...props} />;
  };
};
