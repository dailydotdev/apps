import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  AddUserIcon,
  BlockIcon,
  MedalBadgeIcon,
  RemoveUserIcon,
  VIcon,
} from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { useAuthContext } from '../../contexts/AuthContext';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import { useLazyModal } from '../../hooks/useLazyModal';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { LazyModal } from '../modals/common/types';
import { AuthTriggers } from '../../lib/auth';
import type { UserShortProfile } from '../../lib/user';

interface LiveRoomTileActionsProps {
  user: UserShortProfile;
  className?: string;
  onRemoveSpeaker?: () => void;
  onKick?: () => void;
  isRemoving?: boolean;
  isKicking?: boolean;
  moderationDisabled?: boolean;
}

export const LiveRoomTileActions = ({
  user,
  className,
  onRemoveSpeaker,
  onKick,
  isRemoving = false,
  isKicking = false,
  moderationDisabled = false,
}: LiveRoomTileActionsProps): ReactElement | null => {
  const { user: viewer, showLogin } = useAuthContext();
  const { follow } = useContentPreference();
  const { openModal } = useLazyModal();
  const [followed, setFollowed] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const showRemove = !!onRemoveSpeaker;
  const showKick = !!onKick;
  const moderationCount = (showRemove ? 1 : 0) + (showKick ? 1 : 0);

  if (viewer && viewer.id === user.id && moderationCount === 0) {
    return null;
  }

  const handleFollow = async (): Promise<void> => {
    if (!viewer) {
      showLogin({ trigger: AuthTriggers.Follow });
      return;
    }
    if (followed || followBusy) {
      return;
    }
    setFollowBusy(true);
    try {
      await follow({
        id: user.id,
        entity: ContentPreferenceType.User,
        entityName: user.name,
      });
      setFollowed(true);
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

  const isSelf = !!viewer && viewer.id === user.id;
  const showSocial = !isSelf;

  return (
    <div
      className={classNames(
        'pointer-events-auto flex max-w-0 items-center gap-1 overflow-hidden opacity-0 transition-[max-width,opacity,transform] duration-200 ease-out group-hover:max-w-[7rem] group-hover:opacity-100',
        '-translate-x-1 group-hover:translate-x-0',
        className,
      )}
    >
      {showSocial ? (
        <Tooltip
          content={followed ? `Following ${user.name}` : `Follow ${user.name}`}
        >
          <Button
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            className="!text-white"
            icon={followed ? <VIcon secondary /> : <AddUserIcon />}
            loading={followBusy}
            disabled={followed || followBusy}
            aria-label={
              followed ? `Following ${user.name}` : `Follow ${user.name}`
            }
            onClick={handleFollow}
          />
        </Tooltip>
      ) : null}
      {showSocial ? (
        <Tooltip content={`Award ${user.name}`}>
          <Button
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            className="!text-white"
            icon={<MedalBadgeIcon secondary />}
            aria-label={`Award ${user.name}`}
            onClick={handleAward}
          />
        </Tooltip>
      ) : null}
      {showRemove ? (
        <Tooltip content={`Remove ${user.name} from stage`}>
          <Button
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
          <Button
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
