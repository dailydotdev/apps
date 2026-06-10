import type { MouseEvent, ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { Squad } from '../../graphql/sources';
import { PinIcon, StarIcon } from '../icons';
import type { IconSize } from '../Icon';
import { useSquadFavorite } from '../../hooks/squads/useSquadFavorite';

interface SquadFavoriteButtonProps {
  squad: Squad;
  className?: string;
  iconSize?: IconSize;
  // v2 reframes "favorite" as "pin" (placed in the Home → Pinned section).
  // Passed by the v2 callers so this shared button stays context-free.
  asPin?: boolean;
}

export const SquadFavoriteButton = ({
  squad,
  className,
  iconSize,
  asPin = false,
}: SquadFavoriteButtonProps): ReactElement => {
  const { toggleFavorite, isPending } = useSquadFavorite();
  const isFavorited = !!squad.favoritedAt;
  const Icon = asPin ? PinIcon : StarIcon;
  const label = (() => {
    if (asPin) {
      return isFavorited ? 'Unpin squad' : 'Pin squad';
    }
    return isFavorited ? 'Unfavorite squad' : 'Favorite squad';
  })();

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
      aria-label={label}
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
