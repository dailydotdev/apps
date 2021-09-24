import React, { ReactElement } from 'react';
import Link from 'next/link';
import { UseInfiniteQueryResult } from 'react-query';
import { Connection, Upvote } from '../../graphql/common';
import { LazyImage } from '../LazyImage';
import useFeedInfiniteScroll from '../../hooks/feed/useFeedInfiniteScroll';

export type HasUpvoteConnection<T, K extends keyof T> = Record<
  K,
  Connection<Upvote>
>;

export interface UpvoterListProps<
  T extends HasUpvoteConnection<T, K>,
  K extends keyof T,
> {
  queryResult: UseInfiniteQueryResult<T>;
  objectKey: K;
}

export function UpvoterList<
  T extends HasUpvoteConnection<T, K>,
  K extends keyof T,
>({ objectKey, queryResult }: UpvoterListProps<T, K>): ReactElement {
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
        page[objectKey].edges.map(({ node: { user } }) => (
          <Link
            key={user.username}
            href={`https://app.daily.dev/${user.username}`}
          >
            <a className="flex flex-row hover:bg-theme-active px-6 py-3">
              <LazyImage
                imgSrc={user.image}
                imgAlt={user.username}
                className="w-12 h-12 rounded-10"
                ratio="1 / 1"
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
      <div
        className="absolute bottom-0 left-0 h-px w-px opacity-0 pointer-events-none"
        ref={infiniteScrollRef}
      />
    </div>
  );
}

export default UpvoterList;
