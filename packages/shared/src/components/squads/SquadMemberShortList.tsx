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

function kFormatter(num: number): string | number {
  return Math.abs(num) > 999 ? `${(num / 1000).toFixed(1)}K` : num;
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
          'flex flex-row-reverse items-center rounded-12 border border-theme-divider-secondary p-1 pl-3 hover:bg-theme-hover active:bg-theme-active',
          className,
        )}
        onClick={openMemberListModal}
      >
        <span
          className="ml-2 mr-1 min-w-[1rem]"
          aria-label="squad-members-count"
        >
          {kFormatter(squad.membersCount)}
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
