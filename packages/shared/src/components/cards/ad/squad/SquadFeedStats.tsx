import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import { SquadAdStat } from './SquadAdStat';
import { pluralize } from '../../../../lib/strings';
import { Separator } from '../../common/common';

interface SquadFeedStatsProps {
  source: Squad;
}

export function SquadFeedStats({ source }: SquadFeedStatsProps): ReactElement {
  const totalPosts = source.flags?.totalPosts ?? 0;
  const totalUpvotes = source.flags?.totalUpvotes ?? 0;
  const totalAwards = source.flags?.totalAwards ?? 0;

  return (
    <div className="flex flex-row flex-wrap items-center text-text-tertiary">
      <SquadAdStat label={pluralize('Post', totalPosts)} value={totalPosts} />
      <Separator />
      <SquadAdStat
        label={pluralize('Upvote', totalUpvotes)}
        value={totalUpvotes}
      />
      {!!totalAwards && <Separator />}
      {!!totalAwards && (
        <SquadAdStat
          label={pluralize('Award', totalAwards)}
          value={totalAwards}
        />
      )}
    </div>
  );
}
