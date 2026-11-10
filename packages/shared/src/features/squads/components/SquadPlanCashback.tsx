import type { ReactElement } from 'react';
import React from 'react';
import { CoreIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { SquadPlan } from '../lib/plans';
import {
  formatBoostCredits,
  formatCashbackMultiple,
  formatCashbackPromoLength,
  formatSquadPlanCredits,
  getSquadPlanCashbackLabel,
  getSquadPlanCreditsForRate,
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
} from '../lib/plans';
import { useStartupsCashbackPromo } from '../hooks/useStartupsCashbackPromo';

/** A plan card's boost credits line: the plan's own amount struck out during the launch promo. */
export const SquadPlanCashback = ({
  plan,
}: {
  plan: SquadPlan;
}): ReactElement => {
  const promo = useStartupsCashbackPromo();
  const planPercentage = SQUAD_PLAN_CASHBACK_PERCENTAGE[plan];
  const isPromo = !!promo && promo.percentage > planPercentage;

  return (
    <span className="flex flex-wrap items-center gap-1.5 text-text-secondary typo-footnote">
      <CoreIcon size={IconSize.Size16} className="shrink-0" />
      {isPromo ? (
        <>
          <del className="text-text-quaternary" data-promo="strike">
            {formatBoostCredits(
              getSquadPlanCreditsForRate(plan, planPercentage),
            )}
          </del>
          <span>
            <strong className="text-text-primary">
              {formatSquadPlanCredits(plan, promo)}
            </strong>
            {` every month for ${formatCashbackPromoLength(promo.months)}`}
          </span>
        </>
      ) : (
        getSquadPlanCashbackLabel(plan, promo)
      )}
    </span>
  );
};

/** One line above the plans saying the promo is for launch only. */
export const SquadLaunchOfferBanner = (): ReactElement | null => {
  const promo = useStartupsCashbackPromo();

  if (!promo) {
    return null;
  }

  return (
    <div
      data-promo="banner"
      className="flex w-full items-start gap-3 rounded-16 border border-accent-avocado-default bg-accent-avocado-flat p-4"
    >
      <CoreIcon size={IconSize.Medium} className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold typo-callout">
          {`Launch offer: ${formatCashbackMultiple(
            promo.percentage,
          )} your plan in boost credits for ${formatCashbackPromoLength(
            promo.months,
          )}`}
        </span>
        <span className="text-text-secondary typo-footnote">
          Only for companies that join during our launch.
        </span>
      </div>
    </div>
  );
};
