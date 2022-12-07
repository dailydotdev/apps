import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { UseInfiniteQueryResult } from 'react-query';
import useFeedInfiniteScroll from '../../hooks/feed/useFeedInfiniteScroll';

interface InfiniteScrollingProps {
  children: ReactNode;
  placeholder?: ReactNode;
  queryResult: UseInfiniteQueryResult;
  className?: string;
}

function InfiniteScrolling({
  children,
  placeholder,
  queryResult,
  className,
}: InfiniteScrollingProps): ReactElement {
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
    <div className={classNames('flex relative flex-col', className)}>
      {children}
      {queryResult.isFetchingNextPage && placeholder}
      <div
        className="absolute bottom-0 left-0 w-px h-px opacity-0 pointer-events-none"
        ref={infiniteScrollRef}
      />
    </div>
  );
}

export default InfiniteScrolling;
