import React, { ReactElement } from 'react';
import { largeNumberFormat } from '../../../lib';
import { Squad } from '../../../graphql/sources';

interface SquadStatProps {
  count: number;
  label: string;
}

export function SquadStat({ count, label }: SquadStatProps): ReactElement {
  return (
    <span className="flex flex-row text-text-tertiary typo-footnote">
      <strong className="mr-1 text-text-primary typo-subhead">
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
  </div>
);
