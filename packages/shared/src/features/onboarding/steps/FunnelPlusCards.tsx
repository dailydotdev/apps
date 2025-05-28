import React, { useCallback } from 'react';
import { OnboardingPlus } from '../components/OnboardingPlus';
import type { FunnelStepPlusCards } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { withIsActiveGuard } from '../shared/withActiveGuard';

export const FunnelPlusCards = withIsActiveGuard(
  ({ onTransition }: FunnelStepPlusCards) => {
    const onSkip = useCallback(() => {
      onTransition?.({
        type: FunnelStepTransitionType.Skip,
        details: { skip: true },
      });
    }, [onTransition]);

    const onComplete = useCallback(() => {
      onTransition?.({
        type: FunnelStepTransitionType.Complete,
        details: { skip: false },
      });
    }, [onTransition]);

    return <OnboardingPlus onComplete={onComplete} onSkip={onSkip} />;
  },
);

export default FunnelPlusCards;
