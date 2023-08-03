import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { SourceMember, Squad } from '../../graphql/sources';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import useSidebarRendered from '../../hooks/useSidebarRendered';

export interface SquadMemberShortListProps {
  squad: Squad;
  members: SourceMember[];
  className?: string;
}

function SquadMemberShortList({
  squad,
  members,
  className,
}: SquadMemberShortListProps): ReactElement {
  const { sidebarRendered } = useSidebarRendered();
  const { openModal } = useLazyModal();
  const openMemberListModal = () =>
    openModal({
      type: LazyModal.SquadMember,
      props: {
        squad,
        placeholderAmount: squad?.membersCount,
      },
    });

  return (
    <SimpleTooltip placement="top" content="Members list">
      <button
        type="button"
        className={classNames(
          'flex flex-row-reverse items-center p-1 pl-3 hover:bg-theme-hover active:bg-theme-active rounded-12 border border-theme-divider-secondary',
          className,
        )}
        onClick={openMemberListModal}
      >
        <span
          className="mr-1 ml-2 min-w-[1rem]"
          aria-label="squad-members-count"
        >
          {squad.membersCount >= 1000
            ? `${Math.floor(squad.membersCount / 1000)}K`
            : squad.membersCount}
        </span>
        {members?.slice(0, sidebarRendered ? 5 : 3).map(({ user }) => (
          <ProfilePicture
            className="-ml-2"
            size="medium"
            key={user.username}
            user={user}
          />
        ))}
      </button>
    </SimpleTooltip>
  );
}

export default SquadMemberShortList;
