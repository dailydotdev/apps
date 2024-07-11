import {
  useInfiniteQuery,
  InfiniteData,
  QueryKey,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { RequestDataConnection, gqlClient } from '../graphql/common';
import useFeedInfiniteScroll from './feed/useFeedInfiniteScroll';
import { PostItem } from '../graphql/posts';

export type ReadHistoryData = RequestDataConnection<PostItem, 'readHistory'>;

export type ReadHistoryInfiniteData = InfiniteData<ReadHistoryData>;

export interface UseInfiniteReadingHistory {
  hasData: boolean;
  data?: ReadHistoryInfiniteData;
  isInitialLoading: boolean;
  isLoading: boolean;
  infiniteScrollRef: (node?: Element | null) => void;
  queryResult: UseInfiniteQueryResult;
}

interface UseInfiniteReadingHistoryProps {
  key: QueryKey;
  query;
  variables?;
}
function useInfiniteReadingHistory({
  key,
  query,
  variables,
}: UseInfiniteReadingHistoryProps): UseInfiniteReadingHistory {
  const queryResult = useInfiniteQuery<ReadHistoryData>(
    key,
    ({ pageParam }) =>
      gqlClient.request(query, {
        ...variables,
        after: pageParam,
      }),
    {
      getNextPageParam: (lastPage) =>
        lastPage?.readHistory?.pageInfo.hasNextPage &&
        lastPage?.readHistory?.pageInfo.endCursor,
    },
  );
  const { isLoading, isFetchingNextPage, hasNextPage, data, fetchNextPage } =
    queryResult;

  const canFetchMore =
    !isLoading && !isFetchingNextPage && hasNextPage && data.pages.length > 0;

  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage: fetchNextPage,
    canFetchMore,
  });

  const hasData = data?.pages?.some(
    (page) => page.readHistory.edges.length > 0,
  );

  return useMemo(
    () => ({
      queryResult,
      hasData,
      isLoading,
      data,
      isInitialLoading: !hasData && isLoading,
      infiniteScrollRef,
    }),
    [hasData, queryResult, isLoading, data, infiniteScrollRef],
  );
}

export default useInfiniteReadingHistory;
