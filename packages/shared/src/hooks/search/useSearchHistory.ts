import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { getSearchHistory, SearchHistoryData } from '../../graphql/search';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
} from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import useFeedInfiniteScroll from '../feed/useFeedInfiniteScroll';

interface UseSearchHistoryProps {
  limit?: number;
}

interface UseSearchHistory {
  nodes: SearchHistoryData['history']['edges'];
  infiniteScrollRef(node: Element): void;
  result: UseInfiniteQueryResult<InfiniteData<SearchHistoryData>>;
}

export const useSearchHistory = ({
  limit = 30,
}: UseSearchHistoryProps = {}): UseSearchHistory => {
  const { user } = useAuthContext();
  const result = useInfiniteQuery<SearchHistoryData>({
    queryKey: generateQueryKey(
      RequestKey.SearchHistory,
      user,
      `limit:${limit}`,
    ),
    queryFn: ({ pageParam }) =>
      getSearchHistory({ after: pageParam, first: limit }),
    initialPageParam: '',
    enabled: !!user,
    getNextPageParam: ({ history }) => getNextPageParam(history?.pageInfo),
  });

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    result;

  const canFetchMore =
    !isLoading && !isFetchingNextPage && hasNextPage && data.pages.length > 0;

  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage: fetchNextPage,
    canFetchMore,
  });

  const nodes = useMemo(
    () => data?.pages?.map(({ history }) => history.edges).flat() ?? [],
    [data],
  );

  return { nodes, infiniteScrollRef, result };
};
