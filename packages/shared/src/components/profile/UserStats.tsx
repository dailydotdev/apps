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
    <div className="flex flex-wrap gap-2 items-center typo-footnote text-theme-label-tertiary">
      {order.map((key) => (
        <div className="flex gap-1 items-center" key={key} data-testid={key}>
          <b className="typo-subhead text-theme-label-primary">
            {largeNumberFormat(stats[key] || 0)}
          </b>
          <span className="capitalize">{key}</span>
        </div>
      ))}
    </div>
  );
}
