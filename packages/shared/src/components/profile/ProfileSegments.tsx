import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../../lib/user';
import { webappUrl } from '../../lib/constants';
import { Segments, ShellRow } from '../shell/ShellRow';
import { useSegmentPager } from '../shell/useSegmentPager';
import { ButtonSize } from '../buttons/common';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../squads/layout/SquadDirectoryNavbar';

export enum ProfileSegment {
  About = 'About',
  Posts = 'Posts',
  Replies = 'Replies',
  Upvoted = 'Upvoted',
}

const paths: Record<ProfileSegment, string> = {
  [ProfileSegment.About]: '',
  [ProfileSegment.Posts]: '/posts',
  [ProfileSegment.Replies]: '/replies',
  [ProfileSegment.Upvoted]: '/upvoted',
};

// A profile's views on a phone, each on the address it already has.
export function ProfileSegments({
  user,
  active,
  paged = true,
}: {
  user: Pick<PublicProfile, 'username'>;
  active: ProfileSegment;
  // The profile draws the row twice (in the page and docked in the block);
  // only one of them listens for the swipe.
  paged?: boolean;
}): ReactElement {
  const items = Object.values(ProfileSegment).map((segment) => ({
    key: segment,
    label: segment,
    href: `${webappUrl}${user.username}${paths[segment]}`,
    active: segment === active,
    replace: true,
  }));
  useSegmentPager(items, paged);

  return (
    <ShellRow>
      <Segments items={items} />
    </ShellRow>
  );
}

// In the page the profile draws its views the way the squad page draws
// Posts and About: the directory tabs in a row with a rule above.
export function ProfileTabs({
  user,
  active,
}: {
  user: Pick<PublicProfile, 'username'>;
  active: ProfileSegment;
}): ReactElement {
  return (
    <div className="border-t border-border-subtlest-tertiary px-4 tablet:px-6">
      <SquadDirectoryNavbar
        aria-label="Profile sections"
        className="!mx-0 !border-0 !px-0"
      >
        {Object.values(ProfileSegment).map((segment) => (
          <SquadDirectoryNavbarItem
            key={segment}
            buttonSize={ButtonSize.Small}
            isActive={segment === active}
            label={segment}
            ariaLabel={segment}
            path={`${webappUrl}${user.username}${paths[segment]}`}
          />
        ))}
      </SquadDirectoryNavbar>
    </div>
  );
}
