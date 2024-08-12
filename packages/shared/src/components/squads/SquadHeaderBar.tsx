import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement, useMemo } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import SquadHeaderMenu from './SquadHeaderMenu';
import useContextMenu from '../../hooks/useContextMenu';
import SquadMemberShortList, {
  SquadMemberShortListProps,
} from './SquadMemberShortList';
import { useSquadInvitation } from '../../hooks/useSquadInvitation';
import { Origin } from '../../lib/log';
import { TourScreenIndex } from './SquadTour';
import { useSquadTour } from '../../hooks/useSquadTour';
import { verifyPermission } from '../../graphql/squads';
import { SourcePermissions } from '../../graphql/sources';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { isTesting } from '../../lib/constants';
import { SquadJoinButton } from './SquadJoinButton';
import {
  BellIcon,
  ChecklistBIcon,
  AddUserIcon,
  MenuIcon,
  SlackIcon,
} from '../icons';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { ContextMenu } from '../../hooks/constants';
import { useSourceIntegrationQuery } from '../../hooks/integrations/useSourceIntegrationQuery';
import { UserIntegrationType } from '../../graphql/integrations';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileImageSize } from '../ProfilePicture';

export function SquadHeaderBar({
  squad,
  members,
  className,
  ...props
}: SquadMemberShortListProps & HTMLAttributes<HTMLDivElement>): ReactElement {
  const { user } = useAuthContext();
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

  const { data: sourceIntegration, isLoading } = useSourceIntegrationQuery({
    sourceId: squad.id,
    userIntegrationType: UserIntegrationType.Slack,
  });

  const slackButtonLabel = useMemo(() => {
    if (!verifyPermission(squad, SourcePermissions.ConnectSlack)) {
      return null;
    }

    if (isLoading && !sourceIntegration) {
      return null;
    }

    if (!sourceIntegration) {
      return 'Connect to Slack';
    }

    if (sourceIntegration?.userIntegration.userId === user.id) {
      return 'Manage';
    }

    return null;
  }, [sourceIntegration, user, squad, isLoading]);

  return (
    <div
      {...props}
      className={classNames(
        'flex h-fit w-full flex-row flex-wrap justify-center gap-4 tablet:w-auto',
        className,
      )}
    >
      {showJoinButton && (
        <SquadJoinButton
          squad={squad}
          origin={Origin.SquadPage}
          size={ButtonSize.Small}
        />
      )}
      <SquadMemberShortList
        squad={squad}
        members={members}
        size={ProfileImageSize.Small}
      />
      {verifyPermission(squad, SourcePermissions.Invite) && !showJoinButton && (
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          className={classNames(
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
      {!!slackButtonLabel && (
        <Button
          variant={ButtonVariant.Secondary}
          onClick={() => {
            openModal({
              type: LazyModal.SlackIntegration,
              props: {
                source: squad,
              },
            });
          }}
          icon={<SlackIcon />}
          disabled={copying}
          size={ButtonSize.Small}
        >
          {slackButtonLabel}
        </Button>
      )}
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
            variant={ButtonVariant.Float}
            icon={<ChecklistBIcon secondary />}
            onClick={() => {
              setChecklistVisible(!isChecklistVisible);
            }}
            size={ButtonSize.Small}
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
              />
            }
            onClick={() => {
              openModal({
                type: LazyModal.SquadNotifications,
                props: { squad },
              });
            }}
            size={ButtonSize.Small}
          />
        </SimpleTooltip>
      )}
      <SimpleTooltip placement="top" content="Squad options">
        <Button
          className="order-4 tablet:order-5"
          variant={ButtonVariant.Float}
          icon={<MenuIcon />}
          onClick={onMenuClick}
          size={ButtonSize.Small}
        />
      </SimpleTooltip>
      <SquadHeaderMenu squad={squad} />
    </div>
  );
}
