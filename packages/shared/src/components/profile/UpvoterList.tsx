import React, { ReactElement } from 'react';
import Link from 'next/link';
import { UseInfiniteQueryResult } from 'react-query';
import useFeedInfiniteScroll from '../../hooks/feed/useFeedInfiniteScroll';
import { UpvotesData } from '../../graphql/common';
import { UpvoterListPlaceholder } from './UpvoterListPlaceholder';
import { UserShortInfo } from './UserShortInfo';

export interface UpvoterListProps {
  queryResult: UseInfiniteQueryResult<UpvotesData>;
  scrollingContainer?: HTMLElement;
  appendTooltipTo?: HTMLElement;
}

export function UpvoterList({
  queryResult,
  ...props
}: UpvoterListProps): ReactElement {
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
