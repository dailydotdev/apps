import React, { ReactElement } from 'react';
import { largeNumberFormat } from '../../lib/numberFormat';

export interface UserStatsProps {
  stats: { reputation: number; views: number; upvotes: number };
}

const order: (keyof UserStatsProps['stats'])[] = [
  'reputation',
  'views',
  'upvotes',
];

export function UserStats({ stats }: UserStatsProps): ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-2 text-text-tertiary typo-footnote">
      {order.map((key) => (
        <div className="flex items-center gap-1" key={key} data-testid={key}>
          <b className="text-text-primary typo-subhead">
            {largeNumberFormat(stats[key] || 0)}
          </b>
          <span className="capitalize">{key}</span>
        </div>
      ))}
    </div>
  );
}
