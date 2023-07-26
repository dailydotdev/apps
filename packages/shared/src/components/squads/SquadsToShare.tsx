import React, { ReactElement, MouseEvent, useMemo } from 'react';
import { verifyPermission } from '../../graphql/squads';
import { SourcePermissions, Squad } from '../../graphql/sources';
import SourceProfilePicture from '../profile/SourceProfilePicture';
import { SocialShareIcon } from '../widgets/SocialShareIcon';
import { useAuthContext } from '../../contexts/AuthContext';
import { Origin } from '../../lib/analytics';
import PlusIcon from '../icons/Plus';
import { useSquadNavigation } from '../../hooks';
import { ButtonSize } from '../buttons/Button';
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
  squadAvatarSize = 'xlarge',
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
          <SocialShareIcon
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

  if (list.length) return <>{list}</>;

  return (
    <SocialShareIcon
      onClick={() =>
        openNewSquad({
          origin: Origin.Share,
        })
      }
      icon={<PlusIcon className="text-theme-label-invert" />}
      className="!rounded-full btn-primary-cabbage"
      label="New Squad"
      size={size}
    />
  );
}
