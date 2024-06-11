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
import { Origin } from '../../lib/log';
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
  const { copying, logAndCopyLink } = useSquadInvitation({
    squad,
    origin: Origin.SquadPage,
  });
  const { openModal, modal } = useLazyModal();
  const { onMenuClick } = useContextMenu({ id: ContextMenu.SquadMenuContext });

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
  const firstItemClasses = 'order-5 tablet:order-1';

  return (
    <div
      {...props}
      className={classNames(
        'flex h-fit w-full flex-row flex-wrap justify-center gap-4 tablet:w-auto',
        className,
      )}
    >
      {verifyPermission(squad, SourcePermissions.Invite) && !showJoinButton && (
        <Button
          variant={ButtonVariant.Secondary}
          className={classNames(
            firstItemClasses,
            tourIndex === TourScreenIndex.CopyInvitation && 'highlight-pulse',
          )}
          onClick={() => {
            logAndCopyLink();
          }}
          icon={<AddUserIcon />}
          disabled={copying}
        >
          Invitation link
        </Button>
      )}
      {showJoinButton && (
        <SquadJoinButton
          className={{ wrapper: firstItemClasses }}
          squad={squad}
          origin={Origin.SquadPage}
        />
      )}
      <SquadMemberShortList
        className="order-1 tablet:order-2"
        squad={squad}
        members={members}
      />
      {!!squad.currentMember && (
        <SimpleTooltip
          forceLoad={!isTesting}
          visible={isChecklistReady && completedStepsCount < totalStepsCount}
          container={{
            className: '-mb-4 !bg-accent-onion-default !text-white',
          }}
          placement="top"
          content={checklistTooltipText}
          zIndex={3}
        >
          <Button
            data-testid="squad-checklist-button"
            className="order-2 tablet:order-3"
            variant={ButtonVariant.Float}
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
            className="order-3 tablet:order-4"
            variant={ButtonVariant.Float}
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
          className="order-4 tablet:order-5"
          variant={ButtonVariant.Float}
          icon={<MenuIcon size={IconSize.Small} />}
          onClick={onMenuClick}
        />
      </SimpleTooltip>
      <SquadHeaderMenu squad={squad} />
    </div>
  );
}
