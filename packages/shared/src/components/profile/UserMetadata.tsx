import React, { ReactElement } from 'react';
import { PublicProfile } from '../../lib/user';
import JoinedDate from './JoinedDate';
import { Separator } from '../cards/common';

export type UserMetadataProps = Pick<
  PublicProfile,
  'name' | 'username' | 'createdAt'
>;

export function UserMetadata({
  name,
  username,
  createdAt,
}: UserMetadataProps): ReactElement {
  return (
    <div className="flex flex-col text-theme-label-quaternary typo-caption2">
      <h2 className="overflow-hidden font-bold whitespace-nowrap text-theme-label-primary typo-title3 text-ellipsis">
        {name}
      </h2>
      <div className="flex items-center">
        <span className="overflow-hidden whitespace-nowrap text-theme-label-secondary typo-footnote text-ellipsis">
          @{username}
        </span>
        <Separator />
        <JoinedDate
          className="text-theme-label-quaternary typo-caption2"
          date={new Date(createdAt)}
        />
      </div>
    </div>
  );
}
