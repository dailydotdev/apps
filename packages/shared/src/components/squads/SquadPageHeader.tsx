import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Squad, SourceMember, SourcePermissions } from '../../graphql/sources';
import { SquadHeaderBar } from './SquadHeaderBar';
import { SquadImage } from './SquadImage';
import EnableNotification from '../notifications/EnableNotification';
import { FlexCentered, FlexCol } from '../utilities';
import SquadMemberShortList from './SquadMemberShortList';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import SharePostBar, { SharePostBarProps } from './SharePostBar';
import { TutorialKey, useTutorial } from '../../hooks/useTutorial';
import TutorialGuide from '../tutorial/TutorialGuide';
import { TourScreenIndex } from './SquadTour';
import { useSquadTour } from '../../hooks/useSquadTour';
import { verifyPermission } from '../../graphql/squads';
import { NotificationPromptSource } from '../../lib/analytics';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { ActionType } from '../../graphql/actions';
import { Button } from '../buttons/Button';
import classed from '../../lib/classed';

interface SquadPageHeaderProps {
  squad: Squad;
  members: SourceMember[];
  onNewSquadPost: SharePostBarProps['onNewSquadPost'];
  hasTriedOnboarding?: boolean;
}

const MAX_WIDTH = 'laptopL:max-w-[38.5rem]';
const Divider = classed('span', 'flex flex-1 h-px bg-theme-divider-tertiary');

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

  const { openStep, isChecklistVisible } = useSquadChecklist({ squad });

  const shouldShowHighlightPulse =
    tourIndex === TourScreenIndex.Post ||
    (isChecklistVisible && openStep === ActionType.SquadFirstPost);

  return (
    <FlexCol
      className={classNames(
        'relative items-center laptopL:items-start px-6 tablet:pb-20 laptopL:pb-14 tablet:mb-6 w-full tablet:border-b laptopL:px-[4.5rem] min-h-20 border-theme-divider-tertiary',
        sharePostTutorial.isActive && 'laptopL:mb-28 mb-28',
      )}
    >
      <div className="flex flex-col laptopL:flex-row items-center">
        <SquadImage className="w-16 tablet:w-24 h-16 tablet:h-24" {...squad} />
        <FlexCol className="mt-4 laptopL:mt-0 ml-6">
          <h3 className="font-bold text-center laptopL:text-left typo-title2">
            {squad.name}
          </h3>
          <h4 className="mt-1 tablet:mt-2 text-center laptopL:text-left typo-body text-theme-label-tertiary">
            @{squad.handle}
          </h4>
        </FlexCol>
      </div>
      {squad.description && (
        <p
          className={classNames(
            'mt-6 w-full text-center laptopL:text-left typo-body text-theme-label-tertiary',
            MAX_WIDTH,
          )}
        >
          {squad.description}
        </p>
      )}
      <SquadMemberShortList
        squad={squad}
        members={members}
        memberCount={squad.membersCount}
        className="laptopL:hidden my-6"
      />
      <SquadHeaderBar
        squad={squad}
        members={members}
        memberCount={squad.membersCount}
        onNewSquadPost={onNewSquadPost}
        className="laptopL:absolute laptopL:top-0 laptopL:right-[4.5rem]"
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
          'relative tablet:absolute flex flex-col tablet:flex-row justify-center items-center pt-8 tablet:p-0 bottom-0 w-full tablet:translate-y-1/2 laptopL:px-0 bg-theme-bg-primary laptop:max-w-[41.5rem]',
          shouldShowHighlightPulse && 'highlight-pulse',
        )}
      >
        <Divider />
        <SharePostBar
          className="w-full max-w-[30.25rem]"
          onNewSquadPost={onNewSquadPost}
          disabled={!verifyPermission(squad, SourcePermissions.Post)}
        />
        <FlexCentered className="relative my-2 mx-2 w-full tablet:w-auto text-theme-label-tertiary typo-callout">
          <span className="flex tablet:hidden absolute -left-6 h-px w-[calc(100%+3rem)] bg-theme-divider-tertiary" />
          <span className="z-0 px-4 bg-theme-bg-primary">or</span>
        </FlexCentered>
        <Button
          tag="a"
          href={`${squad.permalink}/create`}
          className="w-full tablet:w-auto btn-primary-cabbage"
        >
          New post
        </Button>
        <Divider />
        {sharePostTutorial.isActive && (
          <TutorialGuide
            className="absolute right-0 -bottom-22 tablet:-bottom-24 laptopL:-bottom-20 left-0"
            arrowPlacement={sidebarRendered ? 'left' : 'top'}
          >
            Let&apos;s share your first post 🥳
          </TutorialGuide>
        )}
      </div>
    </FlexCol>
  );
}
