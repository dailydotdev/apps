import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Squad, SquadMember } from '../../graphql/squads';
import { SquadHeaderBar } from './SquadHeaderBar';
import { SquadImage } from './SquadImage';
import EnableNotification from '../notifications/EnableNotification';
import { NotificationPromptSource } from '../../hooks/useEnableNotification';
import { FlexCol } from '../utilities';
import SquadMemberShortList from './SquadMemberShortList';
import useSidebarRendered from '../../hooks/useSidebarRendered';

type SquadPageHeaderProps = {
  squad: Squad;
  members: SquadMember[];
  onNewSquadPost: () => void;
};

const MAX_WIDTH = 'laptop:max-w-[38.5rem]';

export function SquadPageHeader({
  squad,
  members,
  onNewSquadPost,
}: SquadPageHeaderProps): ReactElement {
  const { sidebarRendered } = useSidebarRendered();

  return (
    <FlexCol className="relative items-center laptop:items-start px-6 pb-0 tablet:pb-10 mb-6 w-full tablet:border-b laptop:px-[4.5rem] min-h-20 border-theme-divider-tertiary">
      <div className="flex flex-col laptop:flex-row items-center">
        <SquadImage className="w-16 tablet:w-24 h-16 tablet:h-24" {...squad} />
        <FlexCol className="mt-4 laptop:mt-0 ml-6">
          <h3 className="font-bold typo-title2">{squad.name}</h3>
          <h4 className="mt-1 tablet:mt-2 typo-body text-theme-label-tertiary">
            @{squad.handle}
          </h4>
        </FlexCol>
      </div>
      <p
        className={classNames(
          'mt-6 w-full typo-body text-theme-label-tertiary',
          MAX_WIDTH,
        )}
      >
        {squad.description}
      </p>
      {!sidebarRendered && (
        <SquadMemberShortList
          squad={squad}
          members={members}
          memberCount={squad.membersCount}
          className="my-6"
        />
      )}
      <SquadHeaderBar
        squad={squad}
        members={members}
        memberCount={squad.membersCount}
        onNewSquadPost={onNewSquadPost}
        className={sidebarRendered && 'absolute top-0 right-[4.5rem]'}
      />
      <EnableNotification
        contentName={squad.name}
        source={NotificationPromptSource.SquadPage}
        className={classNames('w-full', MAX_WIDTH)}
      />
    </FlexCol>
  );
}
