import React, { ReactElement, useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';
import {
  getSearchHistory,
  getSearchUrl,
  SearchHistoryData,
} from '../../graphql/search';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import useFeedInfiniteScroll, {
  InfiniteScrollScreenOffset,
} from '../../hooks/feed/useFeedInfiniteScroll';
import { SearchEmpty } from './SearchEmpty';
import { SearchHistoryContainer } from './common';
import { SearchBarSuggestion } from './SearchBarSuggestion';
import { SearchSkeleton } from './SearchSkeleton';
import TimerIcon from '../icons/Timer';

interface SearchHistoryProps {
  showEmptyState?: boolean;
  className?: string;
  title?: string;
}

export function SearchHistory({
  showEmptyState = true,
  className,
  title,
}: SearchHistoryProps): ReactElement {
  const { user } = useAuthContext();
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

  if (isLoading) return <SearchSkeleton className={className} />;

  if (!nodes?.length) return showEmptyState ? <SearchEmpty /> : null;

  return (
    <SearchHistoryContainer className={className}>
      <span className="font-bold text-theme-label-quaternary typo-footnote">
        {title}
      </span>
      {nodes?.map(({ node: { id, prompt } }) => (
        <SearchBarSuggestion
          key={id}
          tag="a"
          icon={<TimerIcon />}
          href={getSearchUrl({ id })}
        >
          {prompt}
        </SearchBarSuggestion>
      ))}
      <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
    </SearchHistoryContainer>
  );
}
