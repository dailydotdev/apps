import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../../lib/user';
import { webappUrl } from '../../lib/constants';
import { Segments, ShellRow } from '../shell/ShellRow';

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
}: {
  user: Pick<PublicProfile, 'username'>;
  active: ProfileSegment;
}): ReactElement {
  return (
    <ShellRow>
      <Segments
        items={Object.values(ProfileSegment).map((segment) => ({
          key: segment,
          label: segment,
          href: `${webappUrl}${user.username}${paths[segment]}`,
          active: segment === active,
          replace: true,
        }))}
      />
    </ShellRow>
  );
}
