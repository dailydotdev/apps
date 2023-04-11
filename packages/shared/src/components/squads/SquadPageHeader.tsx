import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Squad, SourceMember, SourcePermissions } from '../../graphql/sources';
import { SquadHeaderBar } from './SquadHeaderBar';
import { SquadImage } from './SquadImage';
import EnableNotification from '../notifications/EnableNotification';
import { NotificationPromptSource } from '../../hooks/useEnableNotification';
import { FlexCol } from '../utilities';
import SquadMemberShortList from './SquadMemberShortList';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import SharePostBar from './SharePostBar';
import { TutorialKey, useTutorial } from '../../hooks/useTutorial';
import TutorialGuide from '../tutorial/TutorialGuide';
import { TourScreenIndex } from './SquadTour';
import { useSquadTour } from '../../hooks/useSquadTour';
import { verifyPermission } from '../../graphql/squads';

interface SquadPageHeaderProps {
  squad: Squad;
  members: SourceMember[];
  onNewSquadPost: () => void;
  hasTriedOnboarding?: boolean;
}

const MAX_WIDTH = 'laptop:max-w-[38.5rem]';

export function SquadPageHeader({
  squad,
  members,
  onNewSquadPost,
  hasTriedOnboarding,
}: SquadPageHeaderProps): ReactElement {
  const { tourIndex } = useSquadTour();
  const { sidebarRendered } = useSidebarRendered();

  const sharePostTutorial = useTutorial({
    key: TutorialKey.ShareSquadPost,
  });

  return (
    <FlexCol
      className={classNames(
        'relative items-center laptop:items-start px-6 pb-20 tablet:pb-20 laptop:pb-14 mb-6 w-full tablet:border-b laptop:px-[4.5rem] min-h-20 border-theme-divider-tertiary',
        sharePostTutorial.isActive && 'laptop:mb-28 mb-28',
      )}
    >
      <div className="flex flex-col laptop:flex-row items-center">
        <SquadImage className="w-16 tablet:w-24 h-16 tablet:h-24" {...squad} />
        <FlexCol className="mt-4 laptop:mt-0 ml-6">
          <h3 className="font-bold text-center laptop:text-left typo-title2">
            {squad.name}
          </h3>
          <h4 className="mt-1 tablet:mt-2 text-center laptop:text-left typo-body text-theme-label-tertiary">
            @{squad.handle}
          </h4>
        </FlexCol>
      </div>
      {squad.description && (
        <p
          className={classNames(
            'mt-6 w-full text-center laptop:text-left typo-body text-theme-label-tertiary',
            MAX_WIDTH,
          )}
        >
          {squad.description}
        </p>
      )}
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
      {hasTriedOnboarding && (
        <EnableNotification
          contentName={squad.name}
          source={NotificationPromptSource.SquadPage}
          className={classNames('w-full', MAX_WIDTH)}
        />
      )}
      <div
        className={classNames(
          'absolute bottom-0 w-full translate-y-1/2 px-6 laptop:px-0 bg-theme-bg-primary',
          tourIndex === TourScreenIndex.Post && 'highlight-pulse',
          MAX_WIDTH,
        )}
      >
        <SharePostBar
          className="w-full"
          onNewSquadPost={onNewSquadPost}
          disabled={!verifyPermission(squad, SourcePermissions.Post)}
        />
        {sharePostTutorial.isActive && (
          <TutorialGuide
            className="absolute right-0 -bottom-22 tablet:-bottom-24 laptop:-bottom-20 left-0"
            arrowPlacement={sidebarRendered ? 'left' : 'top'}
          >
            Let&apos;s share your first post 🥳
          </TutorialGuide>
        )}
      </div>
    </FlexCol>
  );
}
