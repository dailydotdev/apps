import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { getSearchHistory, SearchHistoryData } from '../../graphql/search';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import useFeedInfiniteScroll from '../feed/useFeedInfiniteScroll';

interface UseSearchHistoryProps {
  limit?: number;
}

interface UseSearchHistory {
  nodes: SearchHistoryData['history']['edges'];
  infiniteScrollRef(node: Element): void;
  result: UseInfiniteQueryResult<SearchHistoryData>;
}

export const useSearchHistory = ({
  limit = 30,
}: UseSearchHistoryProps = {}): UseSearchHistory => {
  const { user } = useAuthContext();
  const result = useInfiniteQuery<SearchHistoryData>(
    generateQueryKey(RequestKey.SearchHistory, user, `limit:${limit}`),
    ({ pageParam }) => getSearchHistory({ after: pageParam, first: limit }),
    {
      enabled: !!user,
      getNextPageParam: (lastPage) =>
        lastPage?.history?.pageInfo.hasNextPage &&
        lastPage?.history?.pageInfo.endCursor,
    },
  );

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
