import React, { ReactElement, useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';
import {
  getSearchHistory,
  getSearchIdUrl,
  SearchHistoryData,
} from '@dailydotdev/shared/src/graphql/search';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import user from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { SearchBarSuggestion } from '@dailydotdev/shared/src/components';
import useFeedInfiniteScroll, {
  InfiniteScrollScreenOffset,
} from '@dailydotdev/shared/src/hooks/feed/useFeedInfiniteScroll';
import { SearchSkeleton } from './SearchSkeleton';
import { SearchEmpty } from './SearchEmpty';
import { SearchHistoryContainer } from './common';

export function SearchHistory(): ReactElement {
  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery<SearchHistoryData>(
      generateQueryKey(RequestKey.SearchHistory, user),
      ({ pageParam }) => getSearchHistory({ after: pageParam, first: 30 }),
      {
        getNextPageParam: (lastPage) =>
          lastPage?.history?.pageInfo.hasNextPage &&
          lastPage?.history?.pageInfo.endCursor,
      },
    );

  const canFetchMore =
    !isLoading && !isFetchingNextPage && hasNextPage && data.pages.length > 0;

  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage: fetchNextPage,
    canFetchMore,
  });

  const nodes = useMemo(
    () => data?.pages?.map(({ history }) => history.edges).flat(),
    [data],
  );

  if (isLoading) return <SearchSkeleton />;

  if (!nodes?.length) return <SearchEmpty />;

  return (
    <SearchHistoryContainer>
      {nodes?.map(({ node: { id, prompt } }) => (
        <SearchBarSuggestion key={id} tag="a" href={getSearchIdUrl(id)}>
          {prompt}
        </SearchBarSuggestion>
      ))}
      <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
    </SearchHistoryContainer>
  );
}
