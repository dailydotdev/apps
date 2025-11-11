import type { ReactElement } from 'react';
import React from 'react';
import { largeNumberFormat } from '../../../lib';
import type { Squad } from '../../../graphql/sources';

interface SquadStatProps {
  count: number;
  label: string;
}

export function SquadStat({ count, label }: SquadStatProps): ReactElement {
  return (
    <span className="text-text-tertiary typo-footnote flex flex-row">
      <strong className="text-text-primary typo-subhead mr-1">
        {largeNumberFormat(count)}
      </strong>
      {label}
    </span>
  );
}

export const SquadStats = ({ flags }: Pick<Squad, 'flags'>): ReactElement => (
  <div className="flex flex-row gap-2">
    <SquadStat count={flags?.totalPosts ?? 0} label="Posts" />
    <SquadStat count={flags?.totalViews ?? 0} label="Views" />
    <SquadStat count={flags?.totalUpvotes ?? 0} label="Upvotes" />
    {flags?.totalAwards ? (
      <SquadStat count={flags?.totalAwards ?? 0} label="Awards" />
    ) : undefined}
  </div>
);
