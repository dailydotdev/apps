import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import { UserShortInfoPlaceholder } from './UserShortInfoPlaceholder';
import type { UserShortInfoProps } from './UserShortInfo';
import { UserShortInfo } from './UserShortInfo';
import type { InfiniteScrollingProps } from '../containers/InfiniteScrolling';
import InfiniteScrolling from '../containers/InfiniteScrolling';
import type { UserShortProfile } from '../../lib/user';

export interface UserListProps {
  scrollingProps: Omit<InfiniteScrollingProps, 'children'>;
  users: UserShortProfile[];
  placeholderAmount?: number;
  additionalContent?: (user: UserShortProfile, index: number) => ReactNode;
  afterContent?: (user: UserShortProfile, index: number) => ReactNode;
  initialItem?: ReactElement;
  isLoading?: boolean;
  emptyPlaceholder?: JSX.Element;
  userInfoProps?: Omit<
    UserShortInfoProps,
    'user' | 'href' | 'tag' | 'children'
  > &
    Partial<Pick<HTMLLinkElement, 'target' | 'rel'>>;
}

function UserList({
  placeholderAmount,
  scrollingProps,
  users,
  additionalContent,
  afterContent,
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
              afterContent={afterContent?.(user, i)}
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
