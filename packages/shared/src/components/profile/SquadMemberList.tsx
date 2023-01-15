import React, { ReactElement } from 'react';
import Link from 'next/link';
import { UseInfiniteQueryResult } from 'react-query';
import classNames from 'classnames';
import { UserShortInfoPlaceholder } from './UserShortInfoPlaceholder';
import { UserShortInfo } from './UserShortInfo';
import InfiniteScrolling from '../containers/InfiniteScrolling';
import { SquadEdgesData } from '../../graphql/squads';
import { Button } from '../buttons/Button';
import MenuIcon from '../icons/Menu';

export interface SquadMemberListProps {
  queryResult: UseInfiniteQueryResult<SquadEdgesData>;
  scrollingContainer?: HTMLElement;
  appendTooltipTo?: HTMLElement;
}

export function SquadMemberList({
  queryResult,
  ...props
}: SquadMemberListProps): ReactElement {
  return (
    <InfiniteScrolling
      queryResult={queryResult}
      placeholder={<UserShortInfoPlaceholder placeholderAmount={1} />}
    >
      {queryResult.data.pages.map(
        (page) =>
          page &&
          page.sourceMembers.edges.map(({ node: { user } }) => (
            <div
              key={user.username}
              className={classNames(
                'flex relative flex-row items-center py-3 px-6 ',
                'hover:bg-theme-hover hover:cursor-pointer',
              )}
            >
              <Link href={user.permalink}>
                <UserShortInfo
                  {...props}
                  tag="a"
                  href={user.permalink}
                  user={user}
                  className="flex-1"
                />
              </Link>
              <Button
                buttonSize="small"
                className="btn-tertiary"
                iconOnly
                icon={<MenuIcon />}
              />
            </div>
          )),
      )}
    </InfiniteScrolling>
  );
}

export default SquadMemberList;
