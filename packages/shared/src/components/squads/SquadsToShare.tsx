import React, { ReactElement, MouseEvent, useMemo } from 'react';
import { verifyPermission } from '../../graphql/squads';
import { SourcePermissions, Squad } from '../../graphql/sources';
import SourceProfilePicture from '../profile/SourceProfilePicture';
import { SocialShareButton } from '../widgets/SocialShareButton';
import { useAuthContext } from '../../contexts/AuthContext';
import { Origin } from '../../lib/log';
import { PlusIcon } from '../icons';
import { useSquadNavigation } from '../../hooks';
import { ButtonColor, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ProfileImageSize } from '../ProfilePicture';

interface SquadsToShareProps {
  isLoading?: boolean;
  onClick: (e: MouseEvent, squad: Squad) => void;
  size?: ButtonSize;
  squadAvatarSize?: ProfileImageSize;
}

export function SquadsToShare({
  isLoading,
  onClick,
  size = ButtonSize.Large,
  squadAvatarSize = ProfileImageSize.XLarge,
}: SquadsToShareProps): ReactElement {
  const { squads } = useAuthContext();
  const { openNewSquad } = useSquadNavigation();

  const list = useMemo(
    () =>
      squads
        ?.filter(
          (squadItem) =>
            squadItem.active &&
            verifyPermission(squadItem, SourcePermissions.Post),
        )
        .map((squad) => (
          <SocialShareButton
            key={squad.id}
            onClick={(e) => onClick(e, squad)}
            icon={
              <SourceProfilePicture source={squad} size={squadAvatarSize} />
            }
            size={size}
            label={`@${squad.handle}`}
            disabled={isLoading}
          />
        )) ?? [],
    [squads, isLoading, onClick, size, squadAvatarSize],
  );

  if (list.length) {
    return <>{list}</>;
  }

  return (
    <SocialShareButton
      onClick={() =>
        openNewSquad({
          origin: Origin.Share,
        })
      }
      icon={<PlusIcon className="text-surface-invert" />}
      variant={ButtonVariant.Primary}
      color={ButtonColor.Cabbage}
      className="!rounded-full"
      label="New Squad"
      size={size}
    />
  );
}
