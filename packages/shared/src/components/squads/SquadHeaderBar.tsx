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
    <div className={classNames('flex flex-wrap gap-4', className)} {...props}>
      <div className="flex items-center rounded-14 border border-theme-divider-secondary">
        <SimpleTooltip placement="top" content="Members list">
          <Button
            className="active:bg-theme-active btn-tertiary !pl-1 !pr-3 !rounded-r-none"
            buttonSize="medium"
            onClick={openMemberListModal}
          >
            <span className="flex items-center">
              <span className="flex flex-row-reverse ml-1">
                {members?.map(({ user }) => (
                  <ProfilePicture
                    className="-ml-2 border-2 border-theme-bg-primary"
                    size="large"
                    key={user.username}
                    user={user}
                  />
                ))}
              </span>
              <span className="ml-3">{memberCount || ''}</span>
            </span>
          </Button>
        </SimpleTooltip>
        <div className="w-0 h-full border-r border-theme-divider-secondary" />
        <SimpleTooltip placement="top" content="Invite a new member">
          <div className="p-1">
            <Button
              className="active:bg-theme-active btn-tertiary"
              buttonSize="small"
              onClick={openSquadInviteModal}
              icon={<AddUserIcon className="text-theme-label-secondary" />}
            />
          </div>
        </SimpleTooltip>
      </div>
      <Button
        className="mobileL:order-2 btn btn-secondary"
        icon={<MenuIcon size="medium" />}
        onClick={onMenuClick}
      />
      <Button
        className="w-full mobileL:w-auto btn btn-secondary"
        onClick={onNewSquadPost}
      >
        Share post
      </Button>
      <SquadHeaderMenu squad={squad} />
    </div>
  );
}
