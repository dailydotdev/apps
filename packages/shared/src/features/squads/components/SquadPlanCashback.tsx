import type { ReactElement } from 'react';
import React from 'react';
import { CoreIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { SquadPlan } from '../lib/plans';
import { getSquadPlanCashbackLabel } from '../lib/plans';
import { useStartupsCashbackPromo } from '../hooks/useStartupsCashbackPromo';

/** A plan card's cashback line, with the launch promo while it is on. */
export const SquadPlanCashback = ({
  plan,
}: {
  plan: SquadPlan;
}): ReactElement => {
  const promo = useStartupsCashbackPromo();

  return (
    <span className="flex items-center gap-1.5 text-text-secondary typo-footnote">
      <CoreIcon size={IconSize.Size16} className="shrink-0" />
      {getSquadPlanCashbackLabel(plan, promo)}
    </span>
  );
};
