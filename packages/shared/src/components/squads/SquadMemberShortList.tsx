import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Squad, SquadMember } from '../../graphql/squads';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

export interface SquadMemberShortListProps {
  squad: Squad;
  members: SquadMember[];
  memberCount: number;
  className?: string;
}

function SquadMemberShortList({
  squad,
  members,
  memberCount,
  className,
}: SquadMemberShortListProps): ReactElement {
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
          'flex flex-row-reverse items-center p-1 pl-3 hover:bg-theme-hover active:bg-theme-active rounded-14 border border-theme-divider-secondary',
          className,
        )}
        onClick={openMemberListModal}
      >
        <span className="ml-2 min-w-[1rem]" aria-label="squad-members-count">
          {memberCount}
        </span>
        {members?.map(({ user }) => (
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
