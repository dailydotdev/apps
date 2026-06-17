import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../squads/layout/SquadDirectoryNavbar';
import { ButtonSize } from '../buttons/Button';
import { checkIsExtension } from '../../lib/func';
import { webappUrl } from '../../lib/constants';

type ExploreSection = {
  label: string;
  // Bare app path — used both to active-match the current route (e.g. /tags or
  // /tags/react keeps the Tags tab active) and as the webapp href. The href is
  // resolved per-context below: the extension needs the webapp origin for the
  // directory pages, the webapp navigates client-side from the bare path.
  path: string;
  // The Explore feed renders in-place in both the webapp and the extension, so
  // it always links to the bare path. The other sections are webapp-only
  // directory pages, so from the extension they must point at webappUrl.
  inPlace?: boolean;
};

const sections: ExploreSection[] = [
  { label: 'Explore', path: '/posts', inPlace: true },
  { label: 'Tags', path: '/tags' },
  { label: 'Sources', path: '/sources' },
  { label: 'Leaderboard', path: '/users' },
  { label: 'Discussions', path: '/discussed' },
];

// Primary navbar for the unified Explore hub (v2). Sits above the Explore
// feed's sort tabs and on the Tags/Sources/Leaderboard/Discussions pages so
// the sections stay one click apart after Discover was folded into Home.
export function ExploreSectionTabs(): ReactElement {
  const router = useRouter();
  const currentPath = (router.asPath || router.pathname).split('?')[0];
  // The extension runs on the extension origin, so directory links must point
  // at the webapp explicitly; the in-place Explore feed stays a bare path.
  const isExtension = checkIsExtension();

  return (
    <SquadDirectoryNavbar
      aria-label="Explore sections"
      className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
    >
      {sections.map((section) => {
        const href =
          isExtension && !section.inPlace
            ? `${webappUrl}${section.path.slice(1)}`
            : section.path;

        return (
          <SquadDirectoryNavbarItem
            key={section.label}
            buttonSize={ButtonSize.Small}
            isActive={
              currentPath === section.path ||
              currentPath.startsWith(`${section.path}/`)
            }
            label={section.label}
            ariaLabel={`Show ${section.label}`}
            path={href}
          />
        );
      })}
    </SquadDirectoryNavbar>
  );
}
