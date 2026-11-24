import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import type { DmGroupMember } from '../types';

const maxShown = 6;

// The members of a group chat as a row of overlapping avatars.
export const SupportChatMembers = ({
  members,
  className,
}: {
  members: DmGroupMember[];
  className?: string;
}): ReactElement => (
  <ul
    aria-label="Members"
    className={classNames('flex items-center -space-x-1.5', className)}
  >
    {members.slice(0, maxShown).map((member) => (
      <li
        key={member.id}
        title={member.name}
        className="rounded-full border-2 border-background-default"
      >
        <ProfilePicture
          user={member}
          size={ProfileImageSize.Small}
          rounded="full"
          nativeLazyLoading
        />
      </li>
    ))}
  </ul>
);
