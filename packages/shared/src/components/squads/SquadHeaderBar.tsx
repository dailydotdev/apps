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
import AddUserIcon from '../icons/AddUser';
import { useSquadInvitation } from '../../hooks/useSquadInvitation';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { Origin } from '../../lib/analytics';
import { TourScreenIndex } from './SquadTour';
import { useSquadTour } from '../../hooks/useSquadTour';
import { verifyPermission } from '../../graphql/squads';
import { SourcePermissions } from '../../graphql/sources';
import ChecklistBIcon from '../icons/ChecklistB';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { isTesting } from '../../lib/constants';

export function SquadHeaderBar({
  squad,
  members,
  memberCount,
  className,
  ...props
}: SquadMemberShortListProps & HTMLAttributes<HTMLDivElement>): ReactElement {
  const { tourIndex } = useSquadTour();
  const { copying, trackAndCopyLink } = useSquadInvitation({
    squad,
    origin: Origin.SquadPage,
  });
  const { onMenuClick } = useContextMenu({ id: 'squad-menu-context' });
  const { sidebarRendered } = useSidebarRendered();

  const {
    steps,
    completedSteps,
    isChecklistVisible,
    setChecklistVisible,
    isChecklistReady,
  } = useSquadChecklist({ squad });

  const completedStepsCount = completedSteps.length;
  const totalStepsCount = steps.length;
  const checklistTooltipText = `${completedStepsCount}/${totalStepsCount}`;

  return (
    <div
      {...props}
      className={classNames('flex flex-row gap-4 h-fit', className)}
    >
      <div className="relative">
        {verifyPermission(squad, SourcePermissions.Invite) && (
          <Button
            className={classNames(
              'btn-secondary',
              tourIndex === TourScreenIndex.CopyInvitation && 'highlight-pulse',
            )}
            onClick={() => {
              trackAndCopyLink();
            }}
            icon={<AddUserIcon />}
            disabled={copying}
          >
            Copy invitation link
          </Button>
        )}
      </div>
      {sidebarRendered && (
        <SquadMemberShortList
          squad={squad}
          members={members}
          memberCount={memberCount}
          className="hidden laptopL:flex"
        />
      )}
      <SimpleTooltip
        forceLoad={!isTesting}
        visible={isChecklistReady && completedStepsCount < totalStepsCount}
        container={{
          className: '-mb-4 bg-theme-color-onion !text-white',
        }}
        placement="top"
        content={checklistTooltipText}
        zIndex={3}
      >
        <Button
          tag="a"
          data-testid="squad-checklist-button"
          className="btn-secondary"
          icon={<ChecklistBIcon secondary size={IconSize.Small} />}
          onClick={() => {
            setChecklistVisible(!isChecklistVisible);
          }}
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
