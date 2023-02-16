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
      <div className="flex overflow-hidden items-center rounded-14 border border-theme-divider-secondary">
        <SimpleTooltip placement="top" content="Members list">
          <button
            type="button"
            className="flex flex-row-reverse items-center p-1 pl-3 hover:bg-theme-hover active:bg-theme-active border-r border-theme-divider-tertiary"
            onClick={openMemberListModal}
          >
            <span className="mr-1 ml-2 min-w-[1rem]">{memberCount}</span>
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
      <Button
        className="mobileL:order-2 btn btn-secondary"
        icon={<MenuIcon size="medium" />}
        onClick={onMenuClick}
      />
      <Button
        className="w-full mobileL:w-auto btn btn-primary"
        onClick={onNewSquadPost}
      >
        Create new post
      </Button>
      <SquadHeaderMenu squad={squad} />
    </div>
  );
}
