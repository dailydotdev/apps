import React, { ReactElement } from 'react';
import Link from 'next/link';
import { UserShortInfoPlaceholder } from './UserShortInfoPlaceholder';
import { UserShortInfo } from './UserShortInfo';
import InfiniteScrolling, {
  InfiniteScrollingProps,
} from '../containers/InfiniteScrolling';
import { UserShortProfile } from '../../lib/user';
import { Button } from '../buttons/Button';
import MenuIcon from '../icons/Menu';

export interface UserListProps {
  scrollingContainer?: HTMLElement;
  appendTooltipTo?: HTMLElement;
  scrollingProps: Omit<InfiniteScrollingProps, 'children'>;
  users: UserShortProfile[];
  placeholderAmount?: number;
  onOptionsClick?: (
    e: React.MouseEvent,
    user: UserShortProfile,
    index: number,
  ) => void | Promise<void>;
}

function UserList({
  placeholderAmount,
  scrollingProps,
  users,
  onOptionsClick,
  ...props
}: UserListProps): ReactElement {
  return (
    <InfiniteScrolling
      {...scrollingProps}
      placeholder={
        <UserShortInfoPlaceholder placeholderAmount={placeholderAmount} />
      }
    >
      {users.map((user, i) => (
        <Link key={user.username} href={user.permalink}>
          <UserShortInfo {...props} tag="a" href={user.permalink} user={user}>
            {onOptionsClick && (
              <Button
                buttonSize="small"
                className="m-auto mr-0 btn-tertiary"
                iconOnly
                icon={<MenuIcon />}
                onClick={(e) => onOptionsClick(e, user, i)}
              />
            )}
          </UserShortInfo>
        </Link>
      ))}
    </InfiniteScrolling>
  );
}

export default UserList;
