import React, { ReactElement, ReactNode } from 'react';
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
  listItemContent?: (user: UserShortProfile, index: number) => ReactNode;
}

function UserList({
  placeholderAmount,
  scrollingProps,
  users,
  listItemContent,
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
            {listItemContent?.(user, i)}
          </UserShortInfo>
        </Link>
      ))}
    </InfiniteScrolling>
  );
}

export default UserList;
