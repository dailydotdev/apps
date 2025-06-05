import React, { useCallback, useEffect, useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { OnboardingPlus } from '../components/OnboardingPlus';
import type { FunnelStepPlusCards } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { useFunnelPlusPricing } from '../hooks/useFunnelPlusPricing';
import { selectedPlanAtom } from '../store/funnel.store';

export const FunnelPlusCards = withIsActiveGuard(
  ({ onTransition }: FunnelStepPlusCards) => {
    const { user } = useAuthContext();
    const { item: priceItem } = useFunnelPlusPricing();
    const setPriceItem = useSetAtom(selectedPlanAtom);
    const { isActionsFetched, completeAction, checkHasCompleted } =
      useActions();
    const hasCompleted = useMemo(
      () =>
        isActionsFetched && checkHasCompleted(ActionType.CheckedPlusPricing),
      [checkHasCompleted, isActionsFetched],
    );
    const completePlusAction = useCallback(
      ({ skip }: { skip: boolean }) => {
        setPriceItem(priceItem.priceId);
        onTransition?.({
          type: skip
            ? FunnelStepTransitionType.Skip
            : FunnelStepTransitionType.Complete,
          details: { skip },
        });
        completeAction(ActionType.CheckedPlusPricing);
      },
      [completeAction, onTransition],
    );

    useEffect(() => {
      if (user?.isPlus || hasCompleted) {
        completePlusAction({ skip: false });
      }
    }, [completePlusAction, hasCompleted, onTransition, user?.isPlus]);

    if (user?.isPlus) {
      return null;
    }

    return (
      <OnboardingPlus
        onComplete={() => completePlusAction({ skip: false })}
        onSkip={() => completePlusAction({ skip: true })}
      />
    );
  },
);

export default FunnelPlusCards;
