import type { ReactElement } from 'react';
import React from 'react';
import { largeNumberFormat } from '../../../lib/numberFormat';
import { IconSize } from '../../Icon';
import type { ReputationIcon } from '../../icons';

interface StatsSectionProps {
  Icon: typeof ReputationIcon;
  iconClassName?: string;
  amount: number;
  label: string;
}

export function DevCardStatsSection({
  amount,
  Icon,
  label,
  iconClassName,
}: StatsSectionProps): ReactElement {
  return (
    <span className="flex flex-col">
      <strong>
        <h2 className="typo-title3 text-white">{largeNumberFormat(amount)}</h2>
      </strong>
      <span className="text-raw-salt-90 typo-caption2 flex items-center">
        <Icon size={IconSize.XSmall} secondary className={iconClassName} />
        {label}
      </span>
    </span>
  );
}
