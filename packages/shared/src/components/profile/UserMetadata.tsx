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
      <h2 className="overflow-hidden text-ellipsis whitespace-nowrap font-bold text-theme-label-primary typo-title3">
        {name}
      </h2>
      <div className="flex items-center">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-theme-label-secondary typo-footnote">
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
