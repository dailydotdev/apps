import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement, useMemo } from 'react';
import {
  AllowedTags,
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import SquadHeaderMenu from './SquadHeaderMenu';
import useContextMenu from '../../hooks/useContextMenu';
import SquadMemberShortList, {
  SquadMemberShortListProps,
} from './SquadMemberShortList';
import { useSquadInvitation } from '../../hooks/useSquadInvitation';
import { Origin } from '../../lib/log';
import { verifyPermission } from '../../graphql/squads';
import { SourcePermissions } from '../../graphql/sources';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { isTesting } from '../../lib/constants';
import { SquadActionButton } from './SquadActionButton';
import {
  BellIcon,
  ChecklistBIcon,
  AddUserIcon,
  MenuIcon,
  SlackIcon,
  TimerIcon,
} from '../icons';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { ContextMenu } from '../../hooks/constants';
import { useSourceIntegrationQuery } from '../../hooks/integrations/useSourceIntegrationQuery';
import { UserIntegrationType } from '../../graphql/integrations';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileImageSize } from '../ProfilePicture';

type SquadBarButtonProps<T extends AllowedTags> = Pick<
  Partial<ButtonProps<T>>,
  'onClick' | 'disabled' | 'icon'
> &
  Pick<SquadMemberShortListProps, 'squad'>;

const SquadSlackButton = <T extends AllowedTags>({
  squad,
  ...props
}: SquadBarButtonProps<T>) => {
  const { user } = useAuthContext();
  const { data: sourceIntegration, isPending } = useSourceIntegrationQuery({
    sourceId: squad.id,
    userIntegrationType: UserIntegrationType.Slack,
  });

  const slackButtonLabel = useMemo(() => {
    if (!verifyPermission(squad, SourcePermissions.ConnectSlack)) {
      return null;
    }

    if (isPending && !sourceIntegration) {
      return null;
    }

    if (!sourceIntegration) {
      return 'Connect to Slack';
    }

    if (sourceIntegration?.userIntegration.userId === user.id) {
      return 'Manage';
    }

    return null;
  }, [sourceIntegration, user, squad, isPending]);

  if (!slackButtonLabel) {
    return null;
  }

  return (
    <Button
      variant={ButtonVariant.Secondary}
      icon={<SlackIcon />}
      size={ButtonSize.Small}
      {...props}
    >
      {slackButtonLabel}
    </Button>
  );
};

const SquadInviteButton = <T extends AllowedTags>({
  squad,
  ...props
}: SquadBarButtonProps<T>) => {
  const canRender = useMemo(() => {
    return verifyPermission(squad, SourcePermissions.Invite);
  }, [squad]);

  if (!canRender) {
    return null;
  }

  return (
    <Button
      variant={ButtonVariant.Secondary}
      size={ButtonSize.Small}
      icon={<AddUserIcon />}
      {...props}
    >
      Invitation link
    </Button>
  );
};

const SquadChecklistButton = ({ squad }: SquadBarButtonProps<'button'>) => {
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
  );
};

const SquadUserNotifications = ({
  squad,
  ...props
}: SquadBarButtonProps<'button'>) => {
  return (
    <SimpleTooltip
      forceLoad={!isTesting}
      placement="bottom"
      content="Squad notifications settings"
    >
      <Button
        data-testid="squad-notification-button"
        className="order-3 tablet:order-4"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        {...props}
      />
    </SimpleTooltip>
  );
};

const SquadModerationButton = ({ squad }: SquadBarButtonProps<'a'>) => {
  if (!squad.moderationRequired || !squad.moderationPostCount) {
    return null;
  }

  const count = squad.moderationPostCount;
  const postLabel = count === 1 ? 'post' : 'posts';

  return (
    <Button
      aria-label={`Go to post moderation page and check ${count} ${postLabel}`}
      href={`/squads/${squad.handle}/moderate`}
      icon={<TimerIcon aria-hidden role="presentation" />}
      size={ButtonSize.Small}
      tag="a"
      title="Go to post moderation page"
      variant={ButtonVariant.Float}
    >
      {count} Pending {postLabel}
    </Button>
  );
};

export function SquadHeaderBar({
  squad,
  members,
  className,
  ...props
}: SquadMemberShortListProps & HTMLAttributes<HTMLDivElement>): ReactElement {
  const { copying, logAndCopyLink } = useSquadInvitation({
    squad,
    origin: Origin.SquadPage,
  });
  const { openModal, modal } = useLazyModal();
  const { onMenuClick } = useContextMenu({ id: ContextMenu.SquadMenuContext });
  const isMember = !!squad.currentMember;
  const userCanJoin = squad.public && !isMember;

  return (
    <div
      {...props}
      className={classNames(
        'flex h-fit w-full flex-row flex-wrap justify-center gap-3 tablet:w-auto',
        className,
      )}
    >
      {userCanJoin && (
        <SquadActionButton
          origin={Origin.SquadPage}
          size={ButtonSize.Small}
          squad={squad}
        />
      )}
      <SquadMemberShortList
        squad={squad}
        members={members}
        size={ProfileImageSize.Small}
      />
      {!userCanJoin && (
        <SquadInviteButton
          squad={squad}
          onClick={() => {
            logAndCopyLink();
          }}
          disabled={copying}
        />
      )}
      <SquadModerationButton squad={squad} />
      <SquadSlackButton
        squad={squad}
        disabled={copying}
        onClick={() => {
          openModal({
            type: LazyModal.SlackIntegration,
            props: {
              source: squad,
              trackStart: true,
            },
          });
        }}
      />
      {isMember && <SquadChecklistButton squad={squad} />}
      {isMember && (
        <SquadUserNotifications
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
          squad={squad}
        />
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
