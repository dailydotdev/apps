import React, { useCallback, useEffect } from 'react';
import { OnboardingPlus } from '../components/OnboardingPlus';
import type { FunnelStepPlusCards } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useAuthContext } from '../../../contexts/AuthContext';

const PlusCards = ({ onTransition }: FunnelStepPlusCards) => {
  const { user } = useAuthContext();

  const transitionToNext = useCallback(
    ({ skip }: { skip: boolean }) => {
      onTransition?.({
        type: skip
          ? FunnelStepTransitionType.Skip
          : FunnelStepTransitionType.Complete,
        details: { skip },
      });
    },
    [onTransition],
  );

  useEffect(() => {
    if (user?.isPlus) {
      transitionToNext({ skip: true });
    }
  }, [transitionToNext, onTransition, user?.isPlus]);

  if (user?.isPlus) {
    return null;
  }

  return (
    <OnboardingPlus
      onComplete={() => transitionToNext({ skip: false })}
      onSkip={() => transitionToNext({ skip: true })}
    />
  );
};

export const FunnelPlusCards = withIsActiveGuard(PlusCards);

export default FunnelPlusCards;
