import classNames from 'classnames';
import type { HTMLAttributes, ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { AllowedTags, ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import SquadHeaderMenu from './SquadHeaderMenu';
import type { SquadMemberShortListProps } from './SquadMemberShortList';
import SquadMemberShortList from './SquadMemberShortList';
import { useSquadInvitation } from '../../hooks/useSquadInvitation';
import { Origin } from '../../lib/log';
import { verifyPermission } from '../../graphql/squads';
import { SourcePermissions } from '../../graphql/sources';
import { SquadActionButton } from './SquadActionButton';
import { AddUserIcon, BellIcon, SlackIcon, TimerIcon } from '../icons';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useSourceIntegrationQuery } from '../../hooks/integrations/useSourceIntegrationQuery';
import { UserIntegrationType } from '../../graphql/integrations';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileImageSize } from '../ProfilePicture';
import { useGetSquadAwardAdmin } from '../../hooks/useCoresFeature';
import { AwardButton } from '../award/AwardButton';
import type { LoggedUser } from '../../lib/user';
import { Tooltip } from '../tooltip/Tooltip';
import { BoostSourceButton } from '../../features/boost/BoostSourceButton';

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

const SquadAwardButton = ({
  squad,
}: Pick<SquadMemberShortListProps, 'squad'>) => {
  const { user } = useAuthContext();
  const eligibleAdmin = useGetSquadAwardAdmin({
    sendingUser: user,
    squad,
  });
  const canAwardSquad = !!eligibleAdmin;

  if (!canAwardSquad) {
    return null;
  }
  return (
    <AwardButton
      type="SQUAD"
      entity={{
        id: squad.id,
        receiver: {
          ...eligibleAdmin,
          name: squad.name,
          image: squad.image,
        } as LoggedUser,
      }}
      variant={ButtonVariant.Float}
      copy="Award"
    />
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

const SquadUserNotifications = ({
  squad,
  ...props
}: SquadBarButtonProps<'button'>) => {
  return (
    <Tooltip side="bottom" content="Squad notifications settings">
      <Button
        data-testid="squad-notification-button"
        className="order-3 tablet:order-4"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        {...props}
      />
    </Tooltip>
  );
};

const SquadModerationButton = ({ squad }: SquadBarButtonProps<'a'>) => {
  const count = squad.moderationPostCount;
  const postLabel = count === 1 ? 'post' : 'posts';

  return (
    <Button
      aria-label={`Check ${count} pending ${postLabel}`}
      href={`/squads/moderate?handle=${squad.handle}`}
      icon={<TimerIcon aria-hidden role="presentation" />}
      size={ButtonSize.Small}
      tag="a"
      title="Go to post moderation page"
      variant={ButtonVariant.Subtle}
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
  const isMember = !!squad.currentMember;
  const userCanJoin = squad.public && !isMember;
  const showPendingCount = !!(
    squad.moderationRequired && squad.moderationPostCount
  );

  return (
    <div
      {...props}
      className={classNames(
        'flex h-fit w-auto flex-row flex-wrap gap-3 ',
        className,
      )}
      data-testid="squad-header-bar"
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
      <SquadAwardButton squad={squad} />
      <BoostSourceButton
        squad={squad}
        buttonProps={{ size: ButtonSize.Small }}
      />
      {showPendingCount && <SquadModerationButton squad={squad} />}
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
      <SquadHeaderMenu squad={squad} />
    </div>
  );
}
