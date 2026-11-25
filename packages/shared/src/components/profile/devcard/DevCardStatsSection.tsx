import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
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
    <span className="flex min-w-0 shrink flex-col">
      <strong>
        <h2 className="truncate text-white typo-title3">
          {largeNumberFormat(amount)}
        </h2>
      </strong>
      <span className="flex min-w-0 items-center text-raw-salt-90 typo-caption2">
        <Icon
          size={IconSize.XSmall}
          secondary
          className={classNames('shrink-0', iconClassName)}
        />
        <span className="truncate">{label}</span>
      </span>
    </span>
  );
}
