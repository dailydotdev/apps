import React, { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { UserShortInfoPlaceholder } from './UserShortInfoPlaceholder';
import { UserShortInfo, UserShortInfoProps } from './UserShortInfo';
import InfiniteScrolling, {
  InfiniteScrollingProps,
} from '../containers/InfiniteScrolling';
import { UserShortProfile } from '../../lib/user';

export interface UserListProps {
  scrollingProps: Omit<InfiniteScrollingProps, 'children'>;
  users: UserShortProfile[];
  placeholderAmount?: number;
  additionalContent?: (user: UserShortProfile, index: number) => ReactNode;
  initialItem?: ReactElement;
  isLoading?: boolean;
  emptyPlaceholder?: JSX.Element;
  userInfoProps?: Omit<
    UserShortInfoProps,
    'user' | 'href' | 'tag' | 'children'
  >;
}

function UserList({
  placeholderAmount,
  scrollingProps,
  users,
  additionalContent,
  initialItem,
  isLoading,
  emptyPlaceholder,
  userInfoProps = {},
}: UserListProps): ReactElement {
  const loader = (
    <UserShortInfoPlaceholder placeholderAmount={placeholderAmount} />
  );

  if (users?.length) {
    return (
      <InfiniteScrolling
        {...scrollingProps}
        aria-label="users-list"
        placeholder={loader}
      >
        {!!initialItem && initialItem}
        {users.map((user, i) => (
          <Link key={user.username} href={user.permalink}>
            <UserShortInfo
              {...userInfoProps}
              tag="a"
              href={user.permalink}
              user={user}
            >
              {additionalContent?.(user, i)}
            </UserShortInfo>
          </Link>
        ))}
      </InfiniteScrolling>
    );
  }

  if (isLoading) {
    return loader;
  }

  return emptyPlaceholder ?? loader;
}

export default UserList;
