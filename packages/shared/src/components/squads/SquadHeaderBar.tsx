import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement } from 'react';
import { UserShortProfile } from '../../lib/user';
import { Button } from '../buttons/Button';
import MenuIcon from '../icons/Menu';
import AddUserIcon from '../icons/AddUser';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import useSquadMenu from '../../hooks/useSquadMenu';
import SquadHeaderMenu from './SquadHeaderMenu';

type SquadHeaderBarProps = {
  members: UserShortProfile[];
  memberCount: number;
} & HTMLAttributes<HTMLDivElement>;

export function SquadHeaderBar({
  members,
  memberCount,
  className,
  ...props
}: SquadHeaderBarProps): ReactElement {
  const { onMenuClick } = useSquadMenu();
  return (
    <div className={classNames('flex flex-wrap gap-4', className)} {...props}>
      <SimpleTooltip placement="top" content="Invite a new member">
        <Button className="pr-2 pl-1 hover:border-theme-rank btn-secondary border-theme-divider-secondary">
          <span className="flex gap-2 items-center w-full">
            {members.map((member) => (
              <ProfilePicture
                size="medium"
                key={member.username}
                user={member}
              />
            ))}
            {memberCount || ''}
            <AddUserIcon className="ml-2 text-theme-label-secondary" />
          </span>
        </Button>
      </SimpleTooltip>
      <Button
        className="mobileL:order-2 btn btn-secondary"
        icon={<MenuIcon size="medium" />}
        onClick={onMenuClick}
      />
      <Button className="w-full mobileL:w-auto btn btn-secondary">
        Submit article
      </Button>
      <SquadHeaderMenu />
    </div>
  );
}
