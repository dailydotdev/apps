import React, { ReactElement } from 'react';
import { Squad } from '../../graphql/squads';
import { UserShortProfile } from '../../lib/user';
import { SquadHeaderBar } from './SquadHeaderBar';
import { SquadImage } from './SquadImage';

type SquadPageHeaderProps = {
  squad: Squad;
  members: UserShortProfile[];
  memberCount: number;
};

export function SquadPageHeader({
  squad,
  memberCount,
  members,
}: SquadPageHeaderProps): ReactElement {
  return (
    <section className="flex flex-col mobileL:items-center w-full laptop:border-b min-h-20 border-theme-divider-tertiary">
      <div className="flex flex-row mobileL:flex-col gap-4 mobileL:gap-6 mobileL:items-center w-full">
        <SquadImage
          className="mobileL:mt-2 w-16 mobileL:w-24 h-16 mobileL:h-24"
          {...squad}
        />
        <div className="flex flex-col mobileL:items-center mobileL:w-full">
          <h3 className="mb-2 font-bold typo-title2">{squad.name}</h3>
          <h4 className="typo-body text-theme-label-secondary">
            @{squad.handle}
          </h4>
        </div>
      </div>
      <h4 className="mt-4 mb-6 typo-body text-theme-label-secondary max-w-[42rem]">
        {squad.description}
      </h4>
      <SquadHeaderBar
        className="mb-8 mobileL:mb-12"
        members={members}
        memberCount={memberCount}
      />
    </section>
  );
}
