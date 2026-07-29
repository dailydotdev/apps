import type { MouseEvent, ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { Squad } from '../../graphql/sources';
import { PinIcon } from '../icons';
import { webappUrl } from '../../lib/constants';
import { useSidebarShortcutItems } from './SidebarShortcutsDock';

// v2 reframes a squad "pin" as adding it to the sidebar shortcuts dock (the old
// backend favorite is no longer used in v2). Clicking toggles the squad in/out
// of the dock; it can also be dragged in. Hidden until row hover while unpinned
// to keep the list clean; stays visible (filled) once pinned so the state reads.
export const SquadShortcutPinButton = ({
  squad,
}: {
  squad: Squad;
}): ReactElement => {
  const { isPinned, togglePin } = useSidebarShortcutItems();
  const path = `${webappUrl}squads/${squad.handle}`;
  const pinned = isPinned(path);

  const onClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      togglePin({
        title: squad.name,
        path,
        image: squad.image ?? undefined,
      });
    },
    [togglePin, squad.name, squad.image, path],
  );

  return (
    <button
      type="button"
      aria-label={pinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
      aria-pressed={pinned}
      onClick={onClick}
      className={classNames(
        'focus-outline relative z-1 flex items-center justify-center text-text-tertiary hover:text-text-primary',
        !pinned &&
          'laptop:opacity-0 laptop:transition-opacity laptop:group-focus-within/squad-row:opacity-100 laptop:group-hover/squad-row:opacity-100',
      )}
    >
      <PinIcon secondary={pinned} />
    </button>
  );
};
