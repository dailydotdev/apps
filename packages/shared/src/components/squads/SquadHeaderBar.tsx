import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement } from 'react';
import { Button } from '../buttons/Button';
import MenuIcon from '../icons/Menu';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import SquadHeaderMenu from './SquadHeaderMenu';
import useContextMenu from '../../hooks/useContextMenu';
import SquadMemberShortList, {
  SquadMemberShortListProps,
} from './SquadMemberShortList';
import { IconSize } from '../Icon';
import FeedbackIcon from '../icons/Feedback';
import { squadFeedback } from '../../lib/constants';
import AddUserIcon from '../icons/AddUser';
import { useSquadInvitation } from '../../hooks/useSquadInvitation';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { Origin } from '../../lib/analytics';
import { useTutorial, TutorialKey } from '../../hooks/useTutorial';
import TutorialGuide from '../tutorial/TutorialGuide';
import { TourScreenIndex } from './SquadTour';
import { useSquadTour } from '../../hooks/useSquadTour';
import { verifyPermission } from '../../graphql/squads';
import { SourcePermissions } from '../../graphql/sources';

interface SquadHeaderBarProps
  extends SquadMemberShortListProps,
    HTMLAttributes<HTMLDivElement> {
  onNewSquadPost: () => void;
}

export function SquadHeaderBar({
  squad,
  members,
  memberCount,
  className,
  ...props
}: SquadHeaderBarProps): ReactElement {
  const { tourIndex } = useSquadTour();
  const { copying, trackAndCopyLink } = useSquadInvitation({
    squad,
    origin: Origin.SquadPage,
  });
  const { onMenuClick } = useContextMenu({ id: 'squad-menu-context' });
  const { sidebarRendered } = useSidebarRendered();

  const copyLinkTutorial = useTutorial({
    key: TutorialKey.CopySquadLink,
  });

  return (
    <div
      {...props}
      className={classNames('flex flex-row gap-4 h-fit', className)}
    >
      <div
        className={classNames(
          'relative',
          copyLinkTutorial.isActive && 'laptop:m-0 mb-14 tablet:mb-10',
        )}
      >
        {verifyPermission(squad, SourcePermissions.Invite) && (
          <Button
            className={classNames(
              'btn-primary',
              tourIndex === TourScreenIndex.CopyInvitation && 'highlight-pulse',
            )}
            onClick={() => {
              trackAndCopyLink();

              copyLinkTutorial.complete();
            }}
            icon={<AddUserIcon />}
            disabled={copying}
          >
            Copy invitation link
          </Button>
        )}
        {copyLinkTutorial.isActive && (
          <TutorialGuide className="absolute -bottom-16 laptop:-bottom-14 left-22">
            Invite your first members
          </TutorialGuide>
        )}
      </div>
      {sidebarRendered && (
        <SquadMemberShortList
          squad={squad}
          members={members}
          memberCount={memberCount}
        />
      )}
      <SimpleTooltip placement="top" content="Feedback">
        <Button
          tag="a"
          target="_blank"
          rel="noopener noreferrer"
          href={`${squadFeedback}#user_id=${squad?.currentMember?.user?.id}&squad_id=${squad.id}`}
          className="btn-secondary"
          icon={<FeedbackIcon size={IconSize.Small} />}
        />
      </SimpleTooltip>
      <SimpleTooltip placement="top" content="Squad options">
        <Button
          className="btn-secondary"
          icon={<MenuIcon size={IconSize.Small} />}
          onClick={onMenuClick}
        />
      </SimpleTooltip>
      <SquadHeaderMenu squad={squad} />
    </div>
  );
}
