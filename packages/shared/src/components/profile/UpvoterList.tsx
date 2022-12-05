import React, { ReactElement } from 'react';
import Link from 'next/link';
import { UseInfiniteQueryResult } from 'react-query';
import { UpvotesData } from '../../graphql/common';
import { UpvoterListPlaceholder } from './UpvoterListPlaceholder';
import { UserShortInfo } from './UserShortInfo';
import InfiniteScrolling from '../containers/InfiniteScrolling';

export interface UpvoterListProps {
  queryResult: UseInfiniteQueryResult<UpvotesData>;
  scrollingContainer?: HTMLElement;
  appendTooltipTo?: HTMLElement;
}

export function UpvoterList({
  queryResult,
  ...props
}: UpvoterListProps): ReactElement {
  return (
    <InfiniteScrolling
      queryResult={queryResult}
      placeholder={<UpvoterListPlaceholder placeholderAmount={1} />}
    >
      {queryResult.data.pages.map(
        (page) =>
          page &&
          page.upvotes.edges.map(({ node: { user } }) => (
            <Link key={user.username} href={user.permalink}>
              <UserShortInfo
                {...props}
                tag="a"
                href={user.permalink}
                user={user}
              />
            </Link>
          )),
      )}
    </InfiniteScrolling>
  );
}

export default UpvoterList;
