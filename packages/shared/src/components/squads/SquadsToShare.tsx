import React, { ReactElement, MouseEvent, useMemo } from 'react';
import { verifyPermission } from '../../graphql/squads';
import { SourcePermissions, Squad } from '../../graphql/sources';
import SourceProfilePicture from '../profile/SourceProfilePicture';
import { SocialShareButton } from '../widgets/SocialShareButton';
import { Origin } from '../../lib/analytics';
import { PlusIcon } from '../icons';
import { useSquadNavigation } from '../../hooks';
import { ButtonColor, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ProfileImageSize } from '../ProfilePicture';
import { useSquads } from '../../hooks/squads/useSquads';

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
  squadAvatarSize = 'xlarge',
}: SquadsToShareProps): ReactElement {
  const { squads } = useSquads();
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
