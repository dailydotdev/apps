import type { MouseEvent, ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { Squad } from '../../graphql/sources';
import { PinIcon, StarIcon } from '../icons';
import type { IconSize } from '../Icon';
import { useSquadFavorite } from '../../hooks/squads/useSquadFavorite';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';

interface SquadFavoriteButtonProps {
  squad: Squad;
  className?: string;
  iconSize?: IconSize;
}

export const SquadFavoriteButton = ({
  squad,
  className,
  iconSize,
}: SquadFavoriteButtonProps): ReactElement => {
  const { toggleFavorite, isPending } = useSquadFavorite();
  const { isV2 } = useLayoutVariant();
  const isFavorited = !!squad.favoritedAt;
  // v2 reframes "favorite" as "pin" (placed in the Home → Pinned section).
  const Icon = isV2 ? PinIcon : StarIcon;
  const verb = isV2 ? 'pin' : 'favorite';

  const onClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(squad);
    },
    [squad, toggleFavorite],
  );

  return (
    <button
      type="button"
      aria-label={`${isFavorited ? 'Un' : ''}${verb} squad`}
      aria-pressed={isFavorited}
      disabled={isPending}
      onClick={onClick}
      className={classNames(
        'relative z-1 flex items-center justify-center disabled:opacity-50',
        !isFavorited &&
          'laptop:opacity-0 laptop:transition-opacity laptop:group-focus-within/squad-row:opacity-100 laptop:group-hover/squad-row:opacity-100',
        className,
      )}
    >
      <Icon secondary={isFavorited} size={iconSize} />
    </button>
  );
};
