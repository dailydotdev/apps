import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { UseInfiniteQueryResult } from '@tanstack/react-query';
import useFeedInfiniteScroll from '../../hooks/feed/useFeedInfiniteScroll';

export interface InfiniteScrollingProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'placeholder'> {
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
  ...props
}: InfiniteScrollingProps): ReactElement {
  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage: fetchNextPage,
    canFetchMore,
  });

  return (
    <div {...props} className={classNames('relative flex flex-col', className)}>
      {children}
      {isFetchingNextPage && placeholder}
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
        ref={infiniteScrollRef}
      />
    </div>
  );
}

export default InfiniteScrolling;
