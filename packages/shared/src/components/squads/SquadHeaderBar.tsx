import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement } from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import SquadHeaderMenu from './SquadHeaderMenu';
import useContextMenu from '../../hooks/useContextMenu';
import SquadMemberShortList, {
  SquadMemberShortListProps,
} from './SquadMemberShortList';
import { IconSize } from '../Icon';
import { useSquadInvitation } from '../../hooks/useSquadInvitation';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { Origin } from '../../lib/analytics';
import { TourScreenIndex } from './SquadTour';
import { useSquadTour } from '../../hooks/useSquadTour';
import { verifyPermission } from '../../graphql/squads';
import { SourcePermissions } from '../../graphql/sources';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { isTesting } from '../../lib/constants';
import { SquadJoinButton } from './SquadJoinButton';
import { BellIcon, ChecklistBIcon, AddUserIcon, MenuIcon } from '../icons';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { ContextMenu } from '../../hooks/constants';

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
  const { onMenuClick } = useContextMenu({ id: ContextMenu.SquadMenuContext });
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
  const showJoinButton = squad.public && !squad.currentMember;

  return (
    <div
      {...props}
      className={classNames(
        'flex h-fit w-full flex-row justify-center gap-4 tablet:w-auto',
        className,
      )}
    >
      <div className="relative">
        {verifyPermission(squad, SourcePermissions.Invite) &&
          !showJoinButton && (
            <Button
              variant={ButtonVariant.Secondary}
              className={classNames(
                tourIndex === TourScreenIndex.CopyInvitation &&
                  'highlight-pulse',
              )}
              onClick={() => {
                trackAndCopyLink();
              }}
              icon={<AddUserIcon />}
              disabled={copying}
            >
              Invitation link
            </Button>
          )}
      </div>
      {showJoinButton && (
        <SquadJoinButton
          className="flex w-full flex-1 tablet:ml-auto tablet:w-auto tablet:flex-initial"
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
            className: '-mb-4 !bg-theme-color-onion !text-white',
          }}
          placement="top"
          content={checklistTooltipText}
          zIndex={3}
        >
          <Button
            data-testid="squad-checklist-button"
            variant={ButtonVariant.Secondary}
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
            data-testid="squad-notification-button"
            variant={ButtonVariant.Secondary}
            icon={
              <BellIcon
                secondary={modal?.type === LazyModal.SquadNotifications}
                size={IconSize.Small}
              />
            }
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
          variant={ButtonVariant.Secondary}
          icon={<MenuIcon size={IconSize.Small} />}
          onClick={onMenuClick}
        />
      </SimpleTooltip>
      <SquadHeaderMenu squad={squad} />
    </div>
  );
}
