import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { RequestDataConnection } from '../graphql/common';
import { gqlClient } from '../graphql/common';
import useFeedInfiniteScroll from './feed/useFeedInfiniteScroll';
import type { PostItem } from '../graphql/posts';
import { getNextPageParam } from '../lib/query';

export type ReadHistoryData = RequestDataConnection<PostItem, 'readHistory'>;

export type ReadHistoryInfiniteData = InfiniteData<ReadHistoryData>;

export interface UseInfiniteReadingHistory {
  hasData: boolean;
  data?: ReadHistoryInfiniteData;
  isInitialLoading: boolean;
  isLoading: boolean;
  infiniteScrollRef: (node?: Element | null) => void;
  queryResult: UseInfiniteQueryResult<ReadHistoryInfiniteData>;
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
  const queryResult = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) =>
      gqlClient.request<ReadHistoryData>(query, {
        ...variables,
        after: pageParam,
      }),
    initialPageParam: '',
    getNextPageParam: ({ readHistory }) =>
      getNextPageParam(readHistory?.pageInfo),
  });
  const { isPending, isFetchingNextPage, hasNextPage, data, fetchNextPage } =
    queryResult;

  const canFetchMore =
    !isPending && !isFetchingNextPage && hasNextPage && data.pages.length > 0;

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
      isLoading: isPending,
      data,
      isInitialLoading: !hasData && isPending,
      infiniteScrollRef,
    }),
    [hasData, queryResult, isPending, data, infiniteScrollRef],
  );
}

export default useInfiniteReadingHistory;
