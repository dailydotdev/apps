import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement } from 'react';
import { Button } from '../buttons/Button';
import MenuIcon from '../icons/Menu';
import AddUserIcon from '../icons/AddUser';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import SquadHeaderMenu from './SquadHeaderMenu';
import { Squad, SquadMember } from '../../graphql/squads';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import useContextMenu from '../../hooks/useContextMenu';

type SquadHeaderBarProps = {
  squad: Squad;
  members: SquadMember[];
  memberCount: number;
  onNewSquadPost: () => void;
} & HTMLAttributes<HTMLDivElement>;

export function SquadHeaderBar({
  squad,
  members,
  memberCount,
  className,
  onNewSquadPost,
  ...props
}: SquadHeaderBarProps): ReactElement {
  const { onMenuClick } = useContextMenu({ id: 'squad-menu-context' });
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
    <div
      {...props}
      className={classNames(
        'flex flex-row flex-wrap items-center gap-4',
        className,
      )}
    >
      <div className="flex items-center overflow-hidden rounded-14 border border-theme-divider-secondary">
        <SimpleTooltip placement="top" content="Members list">
          <button
            type="button"
            className="flex flex-row-reverse items-center border-r border-theme-divider-tertiary p-1 pl-3 hover:bg-theme-hover active:bg-theme-active"
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
          className="btn-tertiary m-1 active:bg-theme-active"
          buttonSize="small"
          onClick={openSquadInviteModal}
          icon={<AddUserIcon className="text-theme-label-secondary" />}
        >
          Invite
        </Button>
      </div>
      <SimpleTooltip placement="top" content="Squad options">
        <Button
          className="btn btn-secondary mobileL:order-2"
          icon={<MenuIcon size="medium" />}
          onClick={onMenuClick}
          aria-label="Squad options"
        />
      </SimpleTooltip>
      <Button
        className="btn btn-primary w-full mobileL:w-auto"
        onClick={onNewSquadPost}
      >
        Create new post
      </Button>
      <SquadHeaderMenu squad={squad} />
    </div>
  );
}
