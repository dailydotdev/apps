import React, { ReactElement } from 'react';
import Link from 'next/link';
import { UseInfiniteQueryResult } from 'react-query';
import { LazyImage } from '../LazyImage';
import useFeedInfiniteScroll from '../../hooks/feed/useFeedInfiniteScroll';
import { UpvotesData } from '../../graphql/common';
import { UpvoterListPlaceholder } from './UpvoterListPlaceholder';

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
    enableTrackEngagement: false,
  });

  return (
    <div className="flex flex-col relative">
      {queryResult.data.pages.map((page) =>
        page.upvotes.edges.map(({ node: { user } }) => (
          <Link key={user.username} href={user.permalink}>
            <a className="flex flex-row hover:bg-theme-hover px-6 py-3">
              <LazyImage
                imgSrc={user.image}
                imgAlt={user.username}
                className="w-12 h-12 rounded-10"
              />
              <div className="flex flex-col flex-1 ml-4 typo-callout">
                <span className="font-bold">{user.name}</span>
                <span className="text-theme-label-secondary">
                  @{user.username}
                </span>
                {user.bio && (
                  <span className="mt-1 text-theme-label-tertiary">
                    {user.bio}
                  </span>
                )}
              </div>
            </a>
          </Link>
        )),
      )}
      {queryResult.isFetchingNextPage && (
        <UpvoterListPlaceholder placeholderAmount={1} />
      )}
      <div
        className="absolute bottom-0 left-0 h-px w-px opacity-0 pointer-events-none"
        ref={infiniteScrollRef}
      />
    </div>
  );
}

export default UpvoterList;
