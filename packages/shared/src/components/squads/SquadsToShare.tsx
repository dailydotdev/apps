import React, { ReactElement, MouseEvent, useMemo, useContext } from 'react';
import { verifyPermission } from '../../graphql/squads';
import { SourcePermissions, Squad } from '../../graphql/sources';
import SourceProfilePicture from '../profile/SourceProfilePicture';
import { SocialShareIcon } from '../widgets/SocialShareIcon';
import { useAuthContext } from '../../contexts/AuthContext';
import { Origin } from '../../lib/analytics';
import PlusIcon from '../icons/Plus';
import FeaturesContext from '../../contexts/FeaturesContext';
import { useCreateSquadModal } from '../../hooks/useCreateSquadModal';
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
  const { hasSquadAccess, isFlagsFetched } = useContext(FeaturesContext);
  const { openNewSquadModal } = useCreateSquadModal({
    hasSquads: !!squads?.length,
    hasAccess: hasSquadAccess,
    isFlagsFetched,
  });

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

  if (!hasSquadAccess) return null;
  if (list.length) return <>{list}</>;

  return (
    <SocialShareIcon
      onClick={() =>
        openNewSquadModal({
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
