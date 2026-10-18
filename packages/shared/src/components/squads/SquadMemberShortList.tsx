import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { BasicSourceMember, Squad } from '../../graphql/sources';
import {
  ProfileImageSize,
  ProfilePicture,
  roundClasses,
} from '../ProfilePicture';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { largeNumberFormat } from '../../lib';
import { Tooltip } from '../tooltip/Tooltip';
import { getSquadMembersUrl } from '../../features/squads/lib/routes';

export interface SquadMemberShortListProps {
  squad: Squad;
  members: BasicSourceMember[];
  className?: string;
  size?: ProfileImageSize;
}

function SquadMemberShortList({
  squad,
  members,
  className,
  size = ProfileImageSize.Medium,
}: SquadMemberShortListProps): ReactElement {
  const router = useRouter();
  const { sidebarRendered } = useSidebarRendered();
  const membersUrl = getSquadMembersUrl(squad.handle);

  return (
    <Tooltip side="top" content="Members list">
      <a
        href={membersUrl}
        onClick={(event) => {
          event.preventDefault();
          router.push(membersUrl);
        }}
        className={classNames(
          'flex flex-row-reverse items-center border border-border-subtlest-secondary pl-3 pr-1 hover:bg-surface-hover active:bg-theme-active',
          className,
          roundClasses[size],
        )}
        aria-label={`View ${squad.membersCount} squad members`}
        data-testid="squad-member-short-list"
      >
        <span className="ml-2 mr-1 min-w-[1rem]">
          {largeNumberFormat(squad.membersCount)}
        </span>
        {members?.slice(0, sidebarRendered ? 5 : 3).map(({ user }) => (
          <ProfilePicture
            className="-ml-2"
            size={size}
            key={user.id}
            user={user}
          />
        ))}
      </a>
    </Tooltip>
  );
}

export default SquadMemberShortList;
