import React, { useCallback, useEffect } from 'react';
import type { FunnelStepPlusCards } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useAuthContext } from '../../../contexts/AuthContext';
import { OnboardingPlusControl } from '../components/OnboardingPlusControl';
import { OnboardingPlusVariationV1 } from '../components/OnboardingPlusVariationV1';

const PlusCards = ({ onTransition, parameters }: FunnelStepPlusCards) => {
  const { user } = useAuthContext();
  const { version = 'V1' } = parameters;

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

  const onboardingProps = {
    onComplete: () => transitionToNext({ skip: false }),
    onSkip: () => transitionToNext({ skip: true }),
    parameters,
  };

  switch (version) {
    case 'V2':
      return <OnboardingPlusVariationV1 {...onboardingProps} />;
    default:
      return <OnboardingPlusControl {...onboardingProps} />;
  }
};

export const FunnelPlusCards = withIsActiveGuard(PlusCards);

export default FunnelPlusCards;
