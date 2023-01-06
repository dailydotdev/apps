import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement } from 'react';
import { Button } from '../buttons/Button';
import MenuIcon from '../icons/Menu';
import AddUserIcon from '../icons/AddUser';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import useSquadMenu from '../../hooks/useSquadMenu';
import SquadHeaderMenu from './SquadHeaderMenu';
import { SquadMember } from '../../graphql/squads';

type SquadHeaderBarProps = {
  members: SquadMember[];
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
      <div className="flex items-center px-0.5 rounded-14 border border-theme-divider-secondary">
        <SimpleTooltip placement="top" content="Members list">
          <Button className="btn-tertiary !pl-0" buttonSize="small">
            <span className="flex items-center">
              <span className="flex flex-row-reverse ml-2">
                {members.map(({ user }) => (
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
        <SimpleTooltip placement="top" content="Invite a new member">
          <Button
            className="btn-tertiary"
            buttonSize="small"
            icon={<AddUserIcon className="text-theme-label-secondary" />}
          />
        </SimpleTooltip>
      </div>
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
