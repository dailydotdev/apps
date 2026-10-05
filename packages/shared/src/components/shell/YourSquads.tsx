import type { ReactElement } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import { SquadImage } from '../squads/SquadImage';
import { useAuthContext } from '../../contexts/AuthContext';
import { webappUrl } from '../../lib/constants';

// The member's own squads lead the Squads root: one thumb-sized row of the
// places they already belong to, before anything there is to discover.
export function YourSquads(): ReactElement | null {
  const { squads } = useAuthContext();

  if (!squads?.length) {
    return null;
  }

  return (
    <section aria-label="Your squads" className="-mx-4 flex flex-col gap-2">
      <h2 className="px-4 text-text-tertiary typo-caption1">Your squads</h2>
      <ul className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-4">
        {squads.map((squad) => (
          <li key={squad.id} className="w-14 shrink-0">
            <Link href={`${webappUrl}squads/${squad.handle}`} passHref>
              <a className="shell-press flex flex-col items-center gap-1">
                <SquadImage {...squad} className="size-12" />
                <span className="w-full truncate text-center text-text-secondary typo-caption2">
                  {squad.name}
                </span>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
