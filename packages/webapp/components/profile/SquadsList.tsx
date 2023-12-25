import React, { ReactElement } from 'react';
import {
  SourceMemberRole,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import SquadMemberBadge from '@dailydotdev/shared/src/components/squads/SquadMemberBadge';
import { CardLink } from '@dailydotdev/shared/src/components/cards/Card';

export interface SquadsListProps {
  squads: (Pick<
    Squad,
    'id' | 'handle' | 'name' | 'image' | 'permalink' | 'membersCount'
  > & {
    role?: SourceMemberRole;
  })[];
}

function SquadItem({
  squad,
}: {
  squad: SquadsListProps['squads'][0];
}): ReactElement {
  return (
    <div className="flex relative flex-col p-2 bg-theme-float rounded-2xl w-[160px]">
      <CardLink href={squad.permalink} />
      <div className="flex gap-2 items-center">
        <Image
          src={squad.image}
          alt={squad.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex flex-col">
          <div className="font-bold whitespace-nowrap typo-caption1 text-ellipsis">
            {squad.name}
          </div>
          <div className="whitespace-nowrap text-theme-label-quaternary typo-caption2 text-ellipsis">
            @{squad.handle}
          </div>
        </div>
      </div>
      <div className="flex items-center mt-1 h-6 text-theme-label-tertiary typo-caption2">
        {squad.role === SourceMemberRole.Admin && (
          <>
            <SquadMemberBadge role={squad.role} removeMargins />
            <span className="mx-0.5">&#x2022;</span>
          </>
        )}
        <span className="whitespace-nowrap text-ellipsis">
          {largeNumberFormat(squad.membersCount)} members
        </span>
      </div>
    </div>
  );
}

export function SquadsList({ squads }: SquadsListProps): ReactElement {
  return (
    <div className="flex overflow-x-auto gap-2 items-center no-scrollbar">
      {squads.map((squad) => (
        <SquadItem key={squad.id} squad={squad} />
      ))}
    </div>
  );
}
