import { useContext, useMemo } from 'react';
import { UseInfiniteQueryResult } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { READING_HISTORY_QUERY } from '../../graphql/users';
import useInfiniteReadingHistory from '../useInfiniteReadingHistory';
import { PostItem } from '../useFeed';
import { checkFetchMore } from '../../components/containers/InfiniteScrolling';

interface UseReadingHistory {
  data: PostItem[];
  hasData: boolean;
  isInitialLoading: boolean;
  isLoading: boolean;
  queryResult: UseInfiniteQueryResult;
  canFetchMore: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}

export const usePublicReadingHistory = (): UseReadingHistory => {
  const { user } = useContext(AuthContext);
  const key = ['readHistory', user?.id];
  const queryProps = {
    key,
    query: READING_HISTORY_QUERY,
    variables: {
      isPublic: true,
    },
  };
  const { hasData, data, isInitialLoading, isLoading, queryResult } =
    useInfiniteReadingHistory(queryProps);

  const flat = useMemo(
    () =>
      data?.pages
        .map((page) => page.readHistory.edges.map((edge) => edge.node))
        .flat(),
    [data],
  ) as PostItem[];

  return {
    data: flat,
    hasData,
    isInitialLoading,
    isLoading,
    queryResult,
    canFetchMore: checkFetchMore(queryResult),
    fetchNextPage: queryResult.fetchNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
  };
};
