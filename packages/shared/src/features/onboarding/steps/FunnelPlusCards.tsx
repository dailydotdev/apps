import React, { useCallback, useEffect } from 'react';
import type { FunnelStepPlusCards } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useAuthContext } from '../../../contexts/AuthContext';
import { OnboardingPlusControl } from '../components/OnboardingPlusControl';
import { OnboardingPlusVariationV1 } from '../components/OnboardingPlusVariationV1';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';
import { FunnelStepTopBar } from '../shared/FunnelStepTopBar';

const PlusCards = ({ onTransition, parameters }: FunnelStepPlusCards) => {
  const { user } = useAuthContext();
  const { version = 'V1' } = parameters;
  // Only the header type follows the funnel's shared scale; the paid funnel
  // keeps its own.
  const isOnboarding = useIsOnboardingFunnel();

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
    case 'v2':
      return <OnboardingPlusVariationV1 {...onboardingProps} />;
    default:
      // The Plus step keeps production's layout, so it has no CTA wrapper to
      // carry the strip — it renders it itself.
      return isOnboarding ? (
        <div className="relative flex flex-1 flex-col gap-4">
          <FunnelStepTopBar
            skip={{ onClick: () => transitionToNext({ skip: true }) }}
          />
          <OnboardingPlusControl {...onboardingProps} isOnboarding />
        </div>
      ) : (
        <OnboardingPlusControl {...onboardingProps} />
      );
  }
};

export const FunnelPlusCards = withIsActiveGuard(PlusCards);

export default FunnelPlusCards;
