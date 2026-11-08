import type { ReactElement } from 'react';
import React from 'react';
import { CoreIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { SquadPlan } from '../lib/plans';
import {
  formatCashbackPromoLength,
  getSquadPlanCashbackLabel,
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
} from '../lib/plans';
import { useStartupsCashbackPromo } from '../hooks/useStartupsCashbackPromo';

/** A plan card's cashback line: the plan's rate struck out during the launch promo. */
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
            {`${planPercentage}%`}
          </del>
          <span>
            <strong className="text-text-primary">{`${promo.percentage}% cashback`}</strong>
            {` for ${formatCashbackPromoLength(promo.months)}`}
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
      className="flex w-full items-start gap-3 rounded-16 border border-accent-bacon-default bg-accent-bacon-flat p-4"
    >
      <CoreIcon size={IconSize.Medium} className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold typo-callout">
          {`Launch offer: ${promo.percentage}% cashback for ${formatCashbackPromoLength(
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
