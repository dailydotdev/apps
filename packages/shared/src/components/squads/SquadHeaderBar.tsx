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
import { SquadJoinButton } from './SquadJoinButton';
import BellIcon from '../icons/Bell';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';

export function SquadHeaderBar({
  squad,
  members,
  className,
  ...props
}: SquadMemberShortListProps & HTMLAttributes<HTMLDivElement>): ReactElement {
  const { tourIndex } = useSquadTour();
  const { copying, trackAndCopyLink } = useSquadInvitation({
    squad,
    origin: Origin.SquadPage,
  });
  const { openModal, modal } = useLazyModal();
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
      className={classNames(
        'flex flex-row gap-4 h-fit w-full tablet:w-auto',
        className,
      )}
    >
      <div className="relative">
        {verifyPermission(squad, SourcePermissions.Invite) && (
          <Button
            className={classNames(
              'btn-secondary',
              tourIndex === TourScreenIndex.CopyInvitation && 'highlight-pulse',
              squad.public && 'hidden tablet:flex',
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
      {squad.public && (
        <SquadJoinButton
          className="flex flex-1 tablet:flex-initial -ml-4 tablet:ml-auto w-full tablet:w-auto"
          squad={squad}
          origin={Origin.SquadPage}
        />
      )}
      {sidebarRendered && (
        <SquadMemberShortList
          squad={squad}
          members={members}
          className="hidden laptopL:flex"
        />
      )}
      {!!squad.currentMember && (
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
            data-testid="squad-checklist-button"
            className="btn-secondary"
            icon={<ChecklistBIcon secondary size={IconSize.Small} />}
            onClick={() => {
              setChecklistVisible(!isChecklistVisible);
            }}
          />
        </SimpleTooltip>
      )}
      {!!squad.currentMember && (
        <SimpleTooltip
          forceLoad={!isTesting}
          placement="bottom"
          content="Squad notifications settings"
        >
          <Button
            data-testid="squad-checklist-button"
            className="btn-secondary"
            icon={<BellIcon secondary={!!modal} size={IconSize.Small} />}
            onClick={() => {
              openModal({
                type: LazyModal.SquadNotifications,
                props: { squad },
              });
            }}
          />
        </SimpleTooltip>
      )}
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
