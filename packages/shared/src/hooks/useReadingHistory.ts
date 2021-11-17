import {
  useQueryClient,
  useInfiniteQuery,
  useMutation,
  InfiniteData,
} from 'react-query';
import { useMemo } from 'react';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import { LoggedUser } from '../lib/user';
import {
  READING_HISTORY_QUERY,
  HideReadHistoryProps,
  HIDE_READING_HISTORY_MUTATION,
} from '../graphql/users';
import { ReadHistory } from '../graphql/posts';
import { RequestDataConnection } from '../graphql/common';
import useFeedInfiniteScroll from './feed/useFeedInfiniteScroll';

export type ReadHistoryData = RequestDataConnection<ReadHistory, 'readHistory'>;
export type QueryIndexes = { page: number; edge: number };

export type HideReadHistory = (
  params: HideReadHistoryProps & QueryIndexes,
) => Promise<unknown>;

export type ReadHistoryInfiniteData = InfiniteData<ReadHistoryData>;

export interface UseReadingHistoryReturn {
  hasData: boolean;
  data?: ReadHistoryInfiniteData;
  isInitialLoading: boolean;
  isLoading: boolean;
  hideReadHistory: HideReadHistory;
  infiniteScrollRef: (node?: Element | null) => void;
}

function useReadingHistory(user?: LoggedUser): UseReadingHistoryReturn {
  const key = ['readHistory', user?.id];
  const client = useQueryClient();
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

  const { mutateAsync: hideReadHistory } = useMutation<
    unknown,
    unknown,
    HideReadHistoryProps,
    () => void
  >(
    ({ postId, timestamp }: HideReadHistoryProps) =>
      request(`${apiUrl}/graphql`, HIDE_READING_HISTORY_MUTATION, {
        postId,
        timestamp,
      }),
    {
      onMutate: ({ page, edge }: HideReadHistoryProps & QueryIndexes) => {
        const current = client.getQueryData<ReadHistoryInfiniteData>(key);
        const [history] = current.pages[page].readHistory.edges.splice(edge, 1);
        client.setQueryData(key, (result: ReadHistoryInfiniteData) => ({
          pages: current.pages,
          pageParams: result.pageParams,
        }));

        return () =>
          client.setQueryData(key, (result: ReadHistoryInfiniteData) => {
            result.pages[page].readHistory.edges.push(history);
            return {
              pages: result.pages,
              pageParams: result.pageParams,
            };
          });
      },
      onError: (_, __, rollback) => rollback(),
    },
  );

  const hasData = data?.pages?.some(
    (page) => page.readHistory.edges.length > 0,
  );

  return useMemo(
    () => ({
      hasData,
      isLoading,
      data,
      isInitialLoading: !hasData && isLoading,
      hideReadHistory,
      infiniteScrollRef,
    }),
    [hasData, isLoading, data, hideReadHistory, infiniteScrollRef],
  );
}

export default useReadingHistory;
