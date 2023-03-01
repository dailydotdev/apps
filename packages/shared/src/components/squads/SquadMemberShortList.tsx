import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Squad, SquadMember } from '../../graphql/squads';
import { useLazyModal } from '../../hooks/useLazyModal';
import { Button } from '../buttons/Button';
import AddUserIcon from '../icons/AddUser';
import { LazyModal } from '../modals/common/types';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

export interface SquadMemberShortListProps {
  squad: Squad;
  members: SquadMember[];
  memberCount: number;
}

function SquadMemberShortList({
  squad,
  members,
  memberCount,
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
  const openSquadInviteModal = () =>
    openModal({
      type: LazyModal.SquadInvite,
      props: {
        initialSquad: squad,
      },
    });

  return (
    <div className="flex overflow-hidden items-center rounded-14 border border-theme-divider-secondary">
      <SimpleTooltip placement="top" content="Members list">
        <button
          type="button"
          className="flex flex-row-reverse items-center p-1 pl-3 hover:bg-theme-hover active:bg-theme-active border-r border-theme-divider-tertiary"
          onClick={openMemberListModal}
        >
          <span
            className="mr-1 ml-2 min-w-[1rem]"
            aria-label="squad-members-count"
          >
            {memberCount}
          </span>
          {members?.map(({ user }, index) => (
            <ProfilePicture
              className={classNames(
                '-ml-2 border-2 border-theme-bg-primary',
                index > 2 && 'hidden tablet:flex',
              )}
              size="medium"
              key={user.username}
              user={user}
            />
          ))}
        </button>
      </SimpleTooltip>
      <Button
        className="m-1 active:bg-theme-active btn-tertiary"
        buttonSize="small"
        onClick={openSquadInviteModal}
        icon={<AddUserIcon className="text-theme-label-secondary" />}
      >
        Invite
      </Button>
    </div>
  );
}

export default SquadMemberShortList;
