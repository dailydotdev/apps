import React, { ReactElement } from 'react';
import { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import JoinedDate from '@dailydotdev/shared/src/components/profile/JoinedDate';
import { Separator } from '@dailydotdev/shared/src/components/cards/common';

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
      <h3 className="overflow-hidden font-bold whitespace-nowrap text-theme-label-primary typo-title3 text-ellipsis">
        {name}
      </h3>
      <div className="flex items-center">
        <span className="whitespace-nowrap text-theme-label-secondary typo-footnote text-ellipsis">
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
