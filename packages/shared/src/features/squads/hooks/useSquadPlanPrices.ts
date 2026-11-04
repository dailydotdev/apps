import { useMemo } from 'react';
import { useProductPricingByIds } from '../../../hooks/useProductPricing';
import { getSquadPlanPriceId, SquadPlan, squadPlans } from '../lib/plans';

// Shown until Paddle's preview in the visitor's currency arrives, and where
// the region has none
const listPrices: Record<SquadPlan, string> = {
  [SquadPlan.Starter]: '$49',
  [SquadPlan.Team]: '$199',
};

export const useSquadPlanPrices = (): Record<SquadPlan, string> => {
  const ids = useMemo(() => squadPlans.map(getSquadPlanPriceId), []);
  const { data } = useProductPricingByIds({ ids });

  return useMemo(
    () =>
      Object.fromEntries(
        squadPlans.map((plan) => [
          plan,
          data?.find(({ priceId }) => priceId === getSquadPlanPriceId(plan))
            ?.price.formatted ?? listPrices[plan],
        ]),
      ) as Record<SquadPlan, string>,
    [data],
  );
};
