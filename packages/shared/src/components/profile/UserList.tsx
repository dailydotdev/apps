import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import { UserShortInfoPlaceholder } from './UserShortInfoPlaceholder';
import type { UserShortInfoProps } from './UserShortInfo';
import { UserShortInfo } from './UserShortInfo';
import type { InfiniteScrollingProps } from '../containers/InfiniteScrolling';
import InfiniteScrolling from '../containers/InfiniteScrolling';
import type { UserShortProfile } from '../../lib/user';
import { anchorDefaultRel } from '../../lib/strings';

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
          <div
            className="relative px-6 py-3 hover:bg-surface-hover"
            key={user.username}
          >
            <Link href={user.permalink}>
              <a
                className="absolute inset-0 z-0"
                rel={anchorDefaultRel}
                target="_blank"
                aria-label={`View ${user.username}`}
              />
            </Link>
            <UserShortInfo
              {...userInfoProps}
              className={{ container: '' }}
              tag="div"
              user={user}
              afterContent={afterContent?.(user, i)}
            >
              {additionalContent?.(user, i)}
            </UserShortInfo>
          </div>
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
