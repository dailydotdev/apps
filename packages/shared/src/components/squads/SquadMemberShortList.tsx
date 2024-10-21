import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { SourceMember, Squad } from '../../graphql/sources';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import {
  ProfileImageSize,
  ProfilePicture,
  roundClasses,
} from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { largeNumberFormat } from '../../lib';

export interface SquadMemberShortListProps {
  squad: Squad;
  members: SourceMember[];
  className?: string;
  size?: ProfileImageSize;
}

function SquadMemberShortList({
  squad,
  members,
  className,
  size = ProfileImageSize.Medium,
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
          'flex flex-row-reverse items-center border border-border-subtlest-secondary pl-3 pr-1 hover:bg-surface-hover active:bg-theme-active',
          className,
          roundClasses[size],
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
            size={size}
            key={user.id}
            user={user}
          />
        ))}
      </button>
    </SimpleTooltip>
  );
}

export default SquadMemberShortList;
