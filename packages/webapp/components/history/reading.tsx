import React, { ReactElement, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  READING_HISTORY_QUERY,
  SEARCH_READING_HISTORY_QUERY,
} from '@dailydotdev/shared/src/graphql/users';
import useReadingHistory from '@dailydotdev/shared/src/hooks/useReadingHistory';
import useInfiniteReadingHistory from '@dailydotdev/shared/src/hooks/useInfiniteReadingHistory';
import ReadingHistoryPlaceholder from '@dailydotdev/shared/src/components/history/ReadingHistoryPlaceholder';
import SearchEmptyScreen from '@dailydotdev/shared/src/components/SearchEmptyScreen';
import ReadingHistoryList from '@dailydotdev/shared/src/components/history/ReadingHistoryList';
import dynamic from 'next/dynamic';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import ReadingHistoryEmptyScreen from '@dailydotdev/shared/src/components/history/ReadingHistoryEmptyScreen';

const PostsSearch = dynamic(
  () =>
    import(/* webpackChunkName: "routerPostsSearch" */ '../RouterPostsSearch'),
  { ssr: false },
);

export function ReadingHistory(): ReactElement {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const searchQuery = router.query?.q?.toString();
  const key = generateQueryKey(RequestKey.ReadingHistory, user);
  const queryProps = useMemo(() => {
    if (searchQuery) {
      return {
        key: [...key, searchQuery],
        query: SEARCH_READING_HISTORY_QUERY,
        variables: { query: searchQuery },
      };
    }

    return { key, query: READING_HISTORY_QUERY };
  }, [searchQuery, key]);

  const { hideReadHistory } = useReadingHistory(key);
  const { data, isInitialLoading, isLoading, hasData, infiniteScrollRef } =
    useInfiniteReadingHistory({ ...queryProps });
  const hasReadingHistory = data?.pages?.some(
    (page) => page.readHistory.edges.length > 0,
  );
  const shouldShowEmptyScreen = !hasData && !isLoading;

  if (!hasReadingHistory && !isLoading) {
    return <ReadingHistoryEmptyScreen />;
  }

  return (
    <div
      className="flex flex-col"
      aria-busy={isLoading}
      data-testid="reading-history-container"
    >
      <PostsSearch
        autoFocus={false}
        placeholder="Search reading history"
        suggestionType="searchReadingHistorySuggestions"
        className="m-4"
      />
      {hasData && (
        <ReadingHistoryList
          data={data}
          onHide={hideReadHistory}
          infiniteScrollRef={infiniteScrollRef}
        />
      )}
      {isLoading && (
        <ReadingHistoryPlaceholder amount={isInitialLoading ? 15 : 1} />
      )}
      {shouldShowEmptyScreen && <SearchEmptyScreen />}
    </div>
  );
}
