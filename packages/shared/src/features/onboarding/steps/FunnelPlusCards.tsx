import React, { useCallback, useEffect } from 'react';
import { OnboardingPlus } from '../components/OnboardingPlus';
import type { FunnelStepPlusCards } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useAuthContext } from '../../../contexts/AuthContext';

export const FunnelPlusCards = withIsActiveGuard(
  ({ onTransition }: FunnelStepPlusCards) => {
    const { user } = useAuthContext();

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

    useEffect(() => {
      if (user?.isPlus) {
        onTransition?.({
          type: FunnelStepTransitionType.Skip,
          details: { skip: true },
        });
      }
    }, [onTransition, user?.isPlus]);

    if (user?.isPlus) {
      return null;
    }

    return <OnboardingPlus onComplete={onComplete} onSkip={onSkip} />;
  },
);

export default FunnelPlusCards;
