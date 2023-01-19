import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement } from 'react';
import { Button } from '../buttons/Button';
import MenuIcon from '../icons/Menu';
import AddUserIcon from '../icons/AddUser';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import useSquadMenu from '../../hooks/useSquadMenu';
import SquadHeaderMenu from './SquadHeaderMenu';
import { Squad, SquadMember } from '../../graphql/squads';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';

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
  const { onMenuClick } = useSquadMenu();
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
    <div className={classNames('flex flex-wrap gap-4', className)} {...props}>
      <div className="flex items-center rounded-14 border border-theme-divider-secondary hover:border-theme-divider-primary">
        <SimpleTooltip placement="top" content="Members list">
          <Button
            className="btn-tertiary !pl-1 !pr-4 !rounded-r-none"
            buttonSize="medium"
            onClick={openMemberListModal}
          >
            <span className="flex items-center">
              <span className="flex flex-row-reverse ml-2">
                {members?.map(({ user }) => (
                  <ProfilePicture
                    className="-ml-2"
                    size="medium"
                    key={user.username}
                    user={user}
                  />
                ))}
              </span>
              <span className="ml-4">{memberCount || ''}</span>
            </span>
          </Button>
        </SimpleTooltip>
        <div className="w-0 h-full border-r border-theme-divider-secondary" />
        <SimpleTooltip placement="top" content="Invite a new member">
          <Button
            className="btn-tertiary !rounded-l-none"
            buttonSize="medium"
            icon={<AddUserIcon className="text-theme-label-secondary" />}
          />
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
