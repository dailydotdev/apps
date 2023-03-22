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
  additionalContent?: (user: UserShortProfile, index: number) => ReactNode;
  initialItem?: ReactElement;
}

function UserList({
  placeholderAmount,
  scrollingProps,
  users,
  additionalContent,
  initialItem,
  ...props
}: UserListProps): ReactElement {
  return (
    <InfiniteScrolling
      {...scrollingProps}
      aria-label="users-list"
      placeholder={
        <UserShortInfoPlaceholder placeholderAmount={placeholderAmount} />
      }
    >
      {!!initialItem && initialItem}
      {users.map((user, i) => (
        <Link key={user.username} href={user.permalink}>
          <UserShortInfo {...props} tag="a" href={user.permalink} user={user}>
            {additionalContent?.(user, i)}
          </UserShortInfo>
        </Link>
      ))}
    </InfiniteScrolling>
  );
}

export default UserList;
