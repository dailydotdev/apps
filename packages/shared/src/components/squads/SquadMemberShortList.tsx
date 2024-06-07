import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { SourceMember, Squad } from '../../graphql/sources';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { largeNumberFormat } from '../../lib';

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
          'flex h-10 flex-row-reverse items-center rounded-12 border border-border-subtlest-secondary p-1 pl-3 hover:bg-surface-hover active:bg-theme-active',
          className,
        )}
        onClick={openMemberListModal}
      >
        <span
          className="ml-2 mr-1 min-w-[1rem]"
          aria-label="squad-members-count"
        >
          {largeNumberFormat(squad.membersCount)}
        </span>
        {members?.slice(0, sidebarRendered ? 5 : 3).map(({ user }) => (
          <ProfilePicture
            className="-ml-2"
            size={ProfileImageSize.Medium}
            key={user.username}
            user={user}
          />
        ))}
      </button>
    </SimpleTooltip>
  );
}

export default SquadMemberShortList;
