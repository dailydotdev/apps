import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../squads/layout/SquadDirectoryNavbar';
import { ButtonSize } from '../buttons/Button';

type ExploreSection = {
  label: string;
  path: string;
  // The tab is active when the current path equals `match` or sits under it
  // (e.g. /tags/react keeps the Tags tab active).
  match: string;
};

const sections: ExploreSection[] = [
  { label: 'Explore', path: '/posts', match: '/posts' },
  { label: 'Tags', path: '/tags', match: '/tags' },
  { label: 'Sources', path: '/sources', match: '/sources' },
  { label: 'Leaderboard', path: '/users', match: '/users' },
  { label: 'Discussions', path: '/discussed', match: '/discussed' },
];

// Primary navbar for the unified Explore hub (v2). Sits above the Explore
// feed's sort tabs and on the Tags/Sources/Leaderboard/Discussions pages so
// the sections stay one click apart after Discover was folded into Home.
export function ExploreSectionTabs(): ReactElement {
  const router = useRouter();
  const currentPath = (router.asPath || router.pathname).split('?')[0];

  return (
    <SquadDirectoryNavbar
      aria-label="Explore sections"
      className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
    >
      {sections.map((section) => (
        <SquadDirectoryNavbarItem
          key={section.label}
          buttonSize={ButtonSize.Small}
          isActive={
            currentPath === section.match ||
            currentPath.startsWith(`${section.match}/`)
          }
          label={section.label}
          ariaLabel={`Show ${section.label}`}
          path={section.path}
        />
      ))}
    </SquadDirectoryNavbar>
  );
}
