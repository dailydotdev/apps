import React, { ReactElement } from 'react';
import Link from 'next/link';
import { UserShortInfoPlaceholder } from './UserShortInfoPlaceholder';
import { UserShortInfo } from './UserShortInfo';
import InfiniteScrolling, {
  InfiniteScrollingProps,
} from '../containers/InfiniteScrolling';
import { UserShortProfile } from '../../lib/user';

export interface UserListProps {
  scrollingContainer?: HTMLElement;
  appendTooltipTo?: HTMLElement;
  scrollingProps: Omit<InfiniteScrollingProps, 'children'>;
  users: UserShortProfile[];
  placeholderAmount?: number;
}

function UserList({
  placeholderAmount,
  scrollingProps,
  users,
  ...props
}: UserListProps): ReactElement {
  return (
    <InfiniteScrolling
      {...scrollingProps}
      placeholder={
        <UserShortInfoPlaceholder placeholderAmount={placeholderAmount} />
      }
    >
      {users.map((user) => (
        <Link key={user.username} href={user.permalink}>
          <UserShortInfo {...props} tag="a" href={user.permalink} user={user} />
        </Link>
      ))}
    </InfiniteScrolling>
  );
}

export default UserList;
