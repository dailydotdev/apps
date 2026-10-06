import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../../lib/user';
import { webappUrl } from '../../lib/constants';
import type { RowItem } from '../shell/ShellRow';
import { Segments, ShellRow } from '../shell/ShellRow';
import { useSegmentPager } from '../shell/useSegmentPager';

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

const getItems = (
  user: Pick<PublicProfile, 'username'>,
  active: ProfileSegment,
): RowItem[] =>
  Object.values(ProfileSegment).map((segment) => ({
    key: segment,
    label: segment,
    href: `${webappUrl}${user.username}${paths[segment]}`,
    active: segment === active,
    replace: true,
  }));

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
  const items = getItems(user, active);
  useSegmentPager(items, paged);

  return (
    <ShellRow>
      <Segments items={items} />
    </ShellRow>
  );
}
