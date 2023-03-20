import React, { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { UserShortInfoPlaceholder } from './UserShortInfoPlaceholder';
import { UserShortInfo } from './UserShortInfo';
import InfiniteScrolling, {
  InfiniteScrollingProps,
} from '../containers/InfiniteScrolling';
import { UserShortProfile } from '../../lib/user';
import { Squad } from '../../graphql/squads';
import LinkIcon from '../icons/Link';
import { IconSize } from '../Icon';

export interface UserListProps {
  scrollingContainer?: HTMLElement;
  appendTooltipTo?: HTMLElement;
  scrollingProps: Omit<InfiniteScrollingProps, 'children'>;
  users: UserShortProfile[];
  placeholderAmount?: number;
  additionalContent?: (user: UserShortProfile, index: number) => ReactNode;
  squad?: Squad;
}

function UserList({
  placeholderAmount,
  scrollingProps,
  users,
  additionalContent,
  squad,
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
      {!!squad && (
        <div className="flex justify-start items-center py-3 px-6">
          <div className="flex justify-center items-center mr-4 w-12 h-12 bg-theme-float rounded-10">
            <LinkIcon size={IconSize.Large} />
          </div>
          <p className="text-salt-90 typo-callout">Copy invitation link</p>
        </div>
      )}
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
