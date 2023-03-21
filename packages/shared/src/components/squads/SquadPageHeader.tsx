import React, { ReactElement } from 'react';
import { Squad, SquadMember } from '../../graphql/squads';
import { SquadHeaderBar } from './SquadHeaderBar';
import { SquadImage } from './SquadImage';
import EnableNotification from '../notifications/EnableNotification';
import { NotificationPromptSource } from '../../hooks/useEnableNotification';

type SquadPageHeaderProps = {
  squad: Squad;
  members: SquadMember[];
  onNewSquadPost: () => void;
};

export function SquadPageHeader({
  squad,
  members,
  onNewSquadPost,
}: SquadPageHeaderProps): ReactElement {
  return (
    <section className="flex flex-col items-center px-6 pb-0 tablet:pb-10 mb-6 w-full tablet:border-b min-h-20 border-theme-divider-tertiary">
      <SquadImage
        className="mt-4 w-16 tablet:w-24 h-16 tablet:h-24"
        {...squad}
      />
      <h3 className="mt-4 tablet:mt-6 font-bold typo-title2">{squad.name}</h3>
      <h4 className="mt-1 tablet:mt-2 typo-body text-theme-label-tertiary">
        @{squad.handle}
      </h4>
      <p className="mt-5 tablet:mt-4 w-full text-center typo-body text-theme-label-secondary max-w-[42rem]">
        {squad.description}
      </p>
      <SquadHeaderBar
        className="mt-6"
        squad={squad}
        members={members}
        memberCount={squad.membersCount}
        onNewSquadPost={onNewSquadPost}
      />
      <EnableNotification
        contentName={squad.name}
        source={NotificationPromptSource.SquadPage}
      />
    </section>
  );
}
