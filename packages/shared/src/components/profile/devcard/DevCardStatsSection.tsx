import React, { ReactElement } from 'react';
import { largeNumberFormat } from '../../../lib/numberFormat';
import { IconSize } from '../../Icon';
import { ReputationIcon } from '../../icons';

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
        <h2 className="text-white typo-title3">{largeNumberFormat(amount)}</h2>
      </strong>
      <span className="flex items-center text-raw-salt-90 typo-caption2">
        <Icon size={IconSize.XSmall} secondary className={iconClassName} />
        {label}
      </span>
    </span>
  );
}
