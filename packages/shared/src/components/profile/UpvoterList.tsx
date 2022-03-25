import React, { ReactElement } from 'react';
import Link from 'next/link';
import { UseInfiniteQueryResult } from 'react-query';
import useFeedInfiniteScroll from '../../hooks/feed/useFeedInfiniteScroll';
import { UpvotesData } from '../../graphql/common';
import { UpvoterListPlaceholder } from './UpvoterListPlaceholder';
import { UserShortInfo } from './UserShortInfo';

export interface UpvoterListProps {
  queryResult: UseInfiniteQueryResult<UpvotesData>;
}

export function UpvoterList({ queryResult }: UpvoterListProps): ReactElement {
  const canFetchMore =
    !queryResult.isLoading &&
    !queryResult.isFetchingNextPage &&
    queryResult.hasNextPage &&
    queryResult.data.pages.length > 0;

  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage: queryResult.fetchNextPage,
    canFetchMore,
  });

  return (
    <div className="flex relative flex-col">
      {queryResult.data.pages.map((page) =>
        page.upvotes.edges.map(({ node: { user } }) => (
          <Link key={user.username} href={user.permalink}>
            <UserShortInfo {...user} tag="a" href={user.permalink} />
          </Link>
        )),
      )}
      {queryResult.isFetchingNextPage && (
        <UpvoterListPlaceholder placeholderAmount={1} />
      )}
      <div
        className="absolute bottom-0 left-0 w-px h-px opacity-0 pointer-events-none"
        ref={infiniteScrollRef}
      />
    </div>
  );
}

export default UpvoterList;
