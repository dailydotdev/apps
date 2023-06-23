import React, { ReactElement, MouseEvent, useMemo, useContext } from 'react';
import { verifyPermission } from '../../graphql/squads';
import { SourcePermissions, Squad } from '../../graphql/sources';
import SourceProfilePicture from '../profile/SourceProfilePicture';
import { ShareText, SocialShareIcon } from '../widgets/SocialShareIcon';
import { useAuthContext } from '../../contexts/AuthContext';
import { Origin } from '../../lib/analytics';
import PlusIcon from '../icons/Plus';
import FeaturesContext from '../../contexts/FeaturesContext';
import { useCreateSquadModal } from '../../hooks/useCreateSquadModal';

interface SquadsToShareProps {
  isLoading?: boolean;
  onClick: (e: MouseEvent, squad: Squad) => void;
}

export function SquadsToShare({
  isLoading,
  onClick,
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
          <button
            type="button"
            className="flex overflow-hidden flex-col items-center w-16 text-center"
            key={squad.id}
            onClick={(e) => onClick(e, squad)}
            disabled={isLoading}
          >
            <SourceProfilePicture source={squad} />
            <ShareText className="mt-2 max-w-full truncate">
              @{squad.handle}
            </ShareText>
          </button>
        )) ?? [],
    [squads, isLoading, onClick],
  );

  if (list.length) return <>{list}</>;

  return (
    <SocialShareIcon
      onClick={() =>
        openNewSquadModal({
          origin: Origin.Share,
          redirectAfterCreate: false,
        })
      }
      icon={<PlusIcon className="text-theme-label-invert" />}
      className="!rounded-full btn-primary-cabbage"
      label="New Squad"
    />
  );
}
