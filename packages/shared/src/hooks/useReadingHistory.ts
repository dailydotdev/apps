import { cloneDeep } from 'lodash';
import { apiUrl } from './../lib/config';
import { READING_HISTORY_QUERY, HideReadHistoryProps, HIDE_READING_HISTORY_MUTATION } from './../graphql/users';
import { RequestDataConnection } from './../graphql/common';
import { useQueryClient, useInfiniteQuery, useMutation, UseInfiniteQueryResult, UseMutateAsyncFunction, InfiniteData } from 'react-query';
import { useContext, useMemo } from 'react';
import AuthContext from '../contexts/AuthContext';
import { ReadHistory } from '../graphql/users';
import request from 'graphql-request';
import { isEqual } from 'date-fns';
import useFeedInfiniteScroll from './feed/useFeedInfiniteScroll';

type ReadHistoryData = RequestDataConnection<ReadHistory, 'readHistory'>;
export type QueryIndexes = { page: number, edge: number };

export type HideReadHistory = (params: HideReadHistoryProps & QueryIndexes) => Promise<unknown>;

export type ReadHistoryInfiniteData = InfiniteData<ReadHistoryData>

export interface UseReadingHistoryReturn {
  hasPages: boolean;
  data?: ReadHistoryInfiniteData;
  isInitialLoading: boolean;
  isLoading: boolean;
  hideReadHistory: HideReadHistory;
  infiniteScrollRef: (node?: Element | null) => void;
}

function useReadingHistory(): UseReadingHistoryReturn {
  const { user } = useContext(AuthContext);
  const key = ['readHistory', user?.id];
  const client = useQueryClient();
  const query = useInfiniteQuery<ReadHistoryData>(
    key,
    (props) =>
      request(`${apiUrl}/graphql`, READING_HISTORY_QUERY, { ...props }),
    {
      getNextPageParam: (lastPage) =>
        lastPage?.readHistory?.pageInfo.hasNextPage &&
        lastPage?.readHistory?.pageInfo.endCursor,
    },
  );

    const canFetchMore =
    !query.isLoading &&
    !query.isFetchingNextPage &&
    query.hasNextPage &&
    query.data.pages.length > 0;

  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage: query.fetchNextPage,
    canFetchMore,
  });

  const { mutateAsync: hideReadHistory } = useMutation<
    unknown,
    unknown,
    HideReadHistoryProps,
    () => void
  >(
    ({ postId, timestamp }: HideReadHistoryProps) =>
      request(`${apiUrl}/graphql`, HIDE_READING_HISTORY_MUTATION  , { postId, timestamp }),
    {
      onMutate: ({ page, edge }: HideReadHistoryProps & QueryIndexes) => {
        const current = client.getQueryData<ReadHistoryInfiniteData>(key);
        const clone = cloneDeep(current);

        current.pages[page].readHistory.edges.splice(edge, 1);
        client.setQueryData(key, (data: ReadHistoryInfiniteData) => ({
          pages: current.pages,
          pageParams: data.pageParams,
        }));

        return () =>
          client.setQueryData(key, () => ({
            pages: clone.pages,
            pageParams: clone.pageParams,
          }));
      },
      onError: (_, __, rollback) => rollback(),
    },
  );

  const hasPages = !!query?.data?.pages?.length;

  return useMemo(() => ({
      hasPages,
    isLoading: query.isLoading,
    data: query?.data,
    isInitialLoading: !hasPages && query.isLoading,
    hideReadHistory,
    infiniteScrollRef,
  }), [query, query?.data?.pages, hasPages, hideReadHistory, infiniteScrollRef]);
}

export default useReadingHistory;
