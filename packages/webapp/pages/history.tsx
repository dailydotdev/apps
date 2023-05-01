import React, { ReactElement, useContext, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import useReadingHistory from '@dailydotdev/shared/src/hooks/useReadingHistory';
import useInfiniteReadingHistory, {
  ReadHistoryInfiniteData,
} from '@dailydotdev/shared/src/hooks/useInfiniteReadingHistory';
import ReadingHistoryList from '@dailydotdev/shared/src/components/history/ReadingHistoryList';
import ReadingHistoryPlaceholder from '@dailydotdev/shared/src/components/history/ReadingHistoryPlaceholder';
import ReadingHistoryEmptyScreen from '@dailydotdev/shared/src/components/history/ReadingHistoryEmptyScreen';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';
import SearchEmptyScreen from '@dailydotdev/shared/src/components/SearchEmptyScreen';
import { getLayout } from '../components/layouts/MainLayout';
import {
  READING_HISTORY_QUERY,
  SEARCH_READING_HISTORY_QUERY,
} from '../../shared/src/graphql/users';
import ProtectedPage from '../components/ProtectedPage';

const PostsSearch = dynamic(
  () =>
    import(
      /* webpackChunkName: "routerPostsSearch" */ '../components/RouterPostsSearch'
    ),
  {
    ssr: false,
  },
);

const History = (): ReactElement => {
  const seo = <NextSeo title="Reading History" nofollow noindex />;
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const searchQuery = router.query?.q?.toString();
  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const key = ['readHistory', user?.id];
  const client = useQueryClient();

  const queryProps = useMemo(() => {
    if (searchQuery) {
      return {
        key: [...key, searchQuery],
        query: SEARCH_READING_HISTORY_QUERY,
        variables: { query: searchQuery },
      };
    }
    return {
      key,
      query: READING_HISTORY_QUERY,
    };
  }, [searchQuery, key]);

  const { hideReadHistory } = useReadingHistory(key);
  const { data, isInitialLoading, isLoading, hasData, infiniteScrollRef } =
    useInfiniteReadingHistory({ ...queryProps });

  const hasReadingHistory = client
    .getQueryData<ReadHistoryInfiniteData>(key)
    ?.pages?.some((page) => page.readHistory.edges.length > 0);
  const shouldShowEmptyScreen = !hasData && !isLoading;

  return (
    <ProtectedPage
      seo={seo}
      fallback={<ReadingHistoryEmptyScreen />}
      shouldFallback={!hasReadingHistory && !isLoading}
    >
      <ResponsivePageContainer
        className={isInitialLoading && 'h-screen overflow-hidden'}
        style={{ paddingLeft: 0, paddingRight: 0 }}
        aria-busy={isLoading}
        role="main"
      >
        <div className="px-6 mb-10">
          <h1 className="mb-4 font-bold typo-headline">Reading History</h1>
          <PostsSearch
            autoFocus={false}
            placeholder="Search reading history"
            suggestionType="searchReadingHistorySuggestions"
          />
        </div>
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
      </ResponsivePageContainer>
    </ProtectedPage>
  );
};

History.getLayout = getLayout;

export default History;
