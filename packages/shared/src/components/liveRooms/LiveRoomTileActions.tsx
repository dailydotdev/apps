import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ButtonV2, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
import {
  AddUserIcon,
  BlockIcon,
  MedalBadgeIcon,
  RemoveUserIcon,
  ShieldCheckIcon,
  ShieldIcon,
  VIcon,
} from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { useAuthContext } from '../../contexts/AuthContext';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import { useContentPreferenceStatusQuery } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { useLazyModal } from '../../hooks/useLazyModal';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { LazyModal } from '../modals/common/types';
import { AuthTriggers } from '../../lib/auth';
import type { UserShortProfile } from '../../lib/user';

interface LiveRoomTileActionsProps {
  user: UserShortProfile;
  className?: string;
  onGrantCoHost?: () => void;
  onRevokeCoHost?: () => void;
  onRemoveSpeaker?: () => void;
  onKick?: () => void;
  isGrantingCoHost?: boolean;
  isRevokingCoHost?: boolean;
  isRemoving?: boolean;
  isKicking?: boolean;
  moderationDisabled?: boolean;
}

export const LiveRoomTileActions = ({
  user,
  className,
  onGrantCoHost,
  onRevokeCoHost,
  onRemoveSpeaker,
  onKick,
  isGrantingCoHost = false,
  isRevokingCoHost = false,
  isRemoving = false,
  isKicking = false,
  moderationDisabled = false,
}: LiveRoomTileActionsProps): ReactElement | null => {
  const { user: viewer, showLogin } = useAuthContext();
  const { follow, unfollow } = useContentPreference();
  const { openModal } = useLazyModal();
  const [followBusy, setFollowBusy] = useState(false);
  const isSelf = !!viewer && viewer.id === user.id;
  const { data: followPreference } = useContentPreferenceStatusQuery({
    id: user.id,
    entity: ContentPreferenceType.User,
    queryOptions: { enabled: !isSelf },
  });
  const isFollowing =
    followPreference?.status === ContentPreferenceStatus.Follow ||
    followPreference?.status === ContentPreferenceStatus.Subscribed;

  const showGrantCoHost = !!onGrantCoHost;
  const showRevokeCoHost = !!onRevokeCoHost;
  const showRemove = !!onRemoveSpeaker;
  const showKick = !!onKick;
  const moderationCount =
    (showGrantCoHost ? 1 : 0) +
    (showRevokeCoHost ? 1 : 0) +
    (showRemove ? 1 : 0) +
    (showKick ? 1 : 0);

  if (isSelf && moderationCount === 0) {
    return null;
  }

  const handleFollow = async (): Promise<void> => {
    if (!viewer) {
      showLogin({ trigger: AuthTriggers.Follow });
      return;
    }
    if (followBusy) {
      return;
    }
    setFollowBusy(true);
    try {
      const action = isFollowing ? unfollow : follow;
      await action({
        id: user.id,
        entity: ContentPreferenceType.User,
        entityName: user.name,
      });
    } finally {
      setFollowBusy(false);
    }
  };

  const handleAward = (): void => {
    if (!viewer) {
      showLogin({ trigger: AuthTriggers.GiveAward });
      return;
    }
    openModal({
      type: LazyModal.GiveAward,
      props: {
        type: 'USER',
        entity: {
          id: user.id,
          receiver: {
            id: user.id,
            name: user.name,
            username: user.username,
            image: user.image,
          },
        },
      },
    });
  };

  const showSocial = !isSelf;
  const followLabel = isFollowing
    ? `Unfollow ${user.name}`
    : `Follow ${user.name}`;

  return (
    <div
      className={classNames(
        'pointer-events-auto flex max-w-0 items-center gap-1 overflow-hidden opacity-0 transition-[max-width,opacity,transform] duration-200 ease-out group-hover:max-w-[14rem] group-hover:opacity-100',
        '-translate-x-1 group-hover:translate-x-0',
        className,
      )}
    >
      {showSocial ? (
        <Tooltip content={followLabel}>
          <ButtonV2
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            className="!text-white"
            icon={isFollowing ? <VIcon secondary /> : <AddUserIcon />}
            loading={followBusy}
            disabled={followBusy}
            aria-label={followLabel}
            onClick={handleFollow}
          />
        </Tooltip>
      ) : null}
      {showSocial ? (
        <Tooltip content={`Award ${user.name}`}>
          <ButtonV2
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            className="!text-white"
            icon={<MedalBadgeIcon />}
            aria-label={`Award ${user.name}`}
            onClick={handleAward}
          />
        </Tooltip>
      ) : null}
      {showGrantCoHost ? (
        <Tooltip content={`Grant co-host to ${user.name}`}>
          <ButtonV2
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            className="!text-white"
            icon={<ShieldIcon />}
            loading={isGrantingCoHost}
            disabled={moderationDisabled || isGrantingCoHost}
            aria-label={`Grant co-host to ${user.name}`}
            onClick={onGrantCoHost}
          />
        </Tooltip>
      ) : null}
      {showRevokeCoHost ? (
        <Tooltip content={`Revoke co-host from ${user.name}`}>
          <ButtonV2
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            className="!text-white"
            icon={<ShieldCheckIcon />}
            loading={isRevokingCoHost}
            disabled={moderationDisabled || isRevokingCoHost}
            aria-label={`Revoke co-host from ${user.name}`}
            onClick={onRevokeCoHost}
          />
        </Tooltip>
      ) : null}
      {showRemove ? (
        <Tooltip content={`Remove ${user.name} from stage`}>
          <ButtonV2
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            className="!text-white"
            icon={<RemoveUserIcon />}
            loading={isRemoving}
            disabled={moderationDisabled || isRemoving}
            aria-label={`Remove ${user.name} from stage`}
            onClick={onRemoveSpeaker}
          />
        </Tooltip>
      ) : null}
      {showKick ? (
        <Tooltip content={`Kick ${user.name} from room`}>
          <ButtonV2
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            className="!text-white"
            icon={<BlockIcon />}
            loading={isKicking}
            disabled={moderationDisabled || isKicking}
            aria-label={`Kick ${user.name} from room`}
            onClick={onKick}
          />
        </Tooltip>
      ) : null}
    </div>
  );
};
