import React, { useCallback } from 'react';
import { OnboardingPlus } from '../components/OnboardingPlus';
import type { FunnelStepPlusCards } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';

export const FunnelPlusCards = ({ onTransition }: FunnelStepPlusCards) => {
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
};

export default FunnelPlusCards;
