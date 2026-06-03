import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
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
  variant?: 'inline' | 'drawer';
  onGrantCoHost?: () => void;
  onRevokeCoHost?: () => void;
  onRemoveSpeaker?: () => void;
  onKick?: () => void;
  isGrantingCoHost?: boolean;
  isRevokingCoHost?: boolean;
  isRemoving?: boolean;
  isKicking?: boolean;
  moderationDisabled?: boolean;
  onActionComplete?: () => void;
}

interface LiveRoomTileActionItem {
  key: string;
  drawerLabel: string;
  ariaLabel: string;
  icon: ReactElement;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void | Promise<void>;
}

export const LiveRoomTileActions = ({
  user,
  className,
  variant = 'inline',
  onGrantCoHost,
  onRevokeCoHost,
  onRemoveSpeaker,
  onKick,
  isGrantingCoHost = false,
  isRevokingCoHost = false,
  isRemoving = false,
  isKicking = false,
  moderationDisabled = false,
  onActionComplete,
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

  const actionItems: LiveRoomTileActionItem[] = [];

  if (showSocial) {
    actionItems.push(
      {
        key: 'follow',
        drawerLabel: followLabel,
        ariaLabel: followLabel,
        icon: isFollowing ? <VIcon secondary /> : <AddUserIcon />,
        loading: followBusy,
        disabled: followBusy,
        onClick: handleFollow,
      },
      {
        key: 'award',
        drawerLabel: `Award ${user.name}`,
        ariaLabel: `Award ${user.name}`,
        icon: <MedalBadgeIcon secondary />,
        onClick: handleAward,
      },
    );
  }

  if (showGrantCoHost) {
    actionItems.push({
      key: 'grant',
      drawerLabel: 'Grant co-host',
      ariaLabel: `Grant co-host to ${user.name}`,
      icon: <ShieldIcon />,
      loading: isGrantingCoHost,
      disabled: moderationDisabled || isGrantingCoHost,
      onClick: () => onGrantCoHost?.(),
    });
  }

  if (showRevokeCoHost) {
    actionItems.push({
      key: 'revoke',
      drawerLabel: 'Revoke co-host',
      ariaLabel: `Revoke co-host from ${user.name}`,
      icon: <ShieldCheckIcon />,
      loading: isRevokingCoHost,
      disabled: moderationDisabled || isRevokingCoHost,
      onClick: () => onRevokeCoHost?.(),
    });
  }

  if (showRemove) {
    actionItems.push({
      key: 'remove',
      drawerLabel: 'Remove from stage',
      ariaLabel: `Remove ${user.name} from stage`,
      icon: <RemoveUserIcon />,
      loading: isRemoving,
      disabled: moderationDisabled || isRemoving,
      onClick: () => onRemoveSpeaker?.(),
    });
  }

  if (showKick) {
    actionItems.push({
      key: 'kick',
      drawerLabel: 'Kick from room',
      ariaLabel: `Kick ${user.name} from room`,
      icon: <BlockIcon />,
      loading: isKicking,
      disabled: moderationDisabled || isKicking,
      onClick: () => onKick?.(),
    });
  }

  if (actionItems.length === 0) {
    return null;
  }

  const runDrawerAction = (handler: () => void | Promise<void>) => () => {
    handler();
    onActionComplete?.();
  };

  if (variant === 'drawer') {
    return (
      <div className={classNames('flex flex-col gap-1 p-2', className)}>
        {actionItems.map((item) => (
          <Button
            key={item.key}
            type="button"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Tertiary}
            icon={item.icon}
            loading={item.loading}
            disabled={item.disabled}
            className="!justify-start"
            onClick={runDrawerAction(item.onClick)}
          >
            {item.drawerLabel}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'pointer-events-auto hidden max-w-0 items-center gap-1 overflow-hidden opacity-0 transition-[max-width,opacity,transform] duration-200 ease-out group-hover:max-w-[14rem] group-hover:opacity-100 tablet:flex',
        '-translate-x-1 group-hover:translate-x-0',
        className,
      )}
    >
      {actionItems.map((item) => (
        <Tooltip key={item.key} content={item.ariaLabel}>
          <Button
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            className="!text-white"
            icon={item.icon}
            loading={item.loading}
            disabled={item.disabled}
            aria-label={item.ariaLabel}
            onClick={item.onClick}
          />
        </Tooltip>
      ))}
    </div>
  );
};
