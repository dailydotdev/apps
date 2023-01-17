import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { UseInfiniteQueryResult } from 'react-query';
import useFeedInfiniteScroll from '../../hooks/feed/useFeedInfiniteScroll';

export interface InfiniteScrollingProps {
  children: ReactNode;
  placeholder?: ReactNode;
  className?: string;
  canFetchMore: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}

export const checkFetchMore = (queryResult: UseInfiniteQueryResult): boolean =>
  !queryResult.isLoading &&
  !queryResult.isFetchingNextPage &&
  queryResult.hasNextPage &&
  queryResult.data?.pages.length > 0;

function InfiniteScrolling({
  children,
  placeholder,
  className,
  canFetchMore,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollingProps): ReactElement {
  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage: fetchNextPage,
    canFetchMore,
  });

  return (
    <div className={classNames('flex relative flex-col', className)}>
      {children}
      {isFetchingNextPage && placeholder}
      <div
        className="absolute bottom-0 left-0 w-px h-px opacity-0 pointer-events-none"
        ref={infiniteScrollRef}
      />
    </div>
  );
}

export default InfiniteScrolling;
