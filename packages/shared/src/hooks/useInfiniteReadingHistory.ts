import { useInfiniteQuery, InfiniteData, QueryKey } from 'react-query';
import { useMemo } from 'react';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import { READING_HISTORY_QUERY } from '../graphql/users';
import { ReadHistory } from '../graphql/posts';
import { RequestDataConnection } from '../graphql/common';
import useFeedInfiniteScroll from './feed/useFeedInfiniteScroll';

export type ReadHistoryData = RequestDataConnection<ReadHistory, 'readHistory'>;

export type ReadHistoryInfiniteData = InfiniteData<ReadHistoryData>;

export interface UseInfiniteReadingHistory {
  hasData: boolean;
  data?: ReadHistoryInfiniteData;
  isInitialLoading: boolean;
  isLoading: boolean;
  infiniteScrollRef: (node?: Element | null) => void;
}

function useInfiniteReadingHistory(key: QueryKey): UseInfiniteReadingHistory {
  const { isLoading, isFetchingNextPage, hasNextPage, data, fetchNextPage } =
    useInfiniteQuery<ReadHistoryData>(
      key,
      ({ pageParam }) =>
        request(`${apiUrl}/graphql`, READING_HISTORY_QUERY, {
          after: pageParam,
        }),
      {
        getNextPageParam: (lastPage) =>
          lastPage?.readHistory?.pageInfo.hasNextPage &&
          lastPage?.readHistory?.pageInfo.endCursor,
      },
    );

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
      hasData,
      isLoading,
      data,
      isInitialLoading: !hasData && isLoading,
      infiniteScrollRef,
    }),
    [hasData, isLoading, data, infiniteScrollRef],
  );
}

export default useInfiniteReadingHistory;
