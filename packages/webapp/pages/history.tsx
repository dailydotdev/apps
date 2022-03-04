import React, { ReactElement, useContext, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import useReadingHistory from '@dailydotdev/shared/src/hooks/useReadingHistory';
import useInfiniteReadingHistory from '@dailydotdev/shared/src/hooks/useInfiniteReadingHistory';
import ReadingHistoryList from '@dailydotdev/shared/src/components/history/ReadingHistoryList';
import ReadingHistoryPlaceholder from '@dailydotdev/shared/src/components/history/ReadingHistoryPlaceholder';
import ReadingHistoryEmptyScreen from '@dailydotdev/shared/src/components/history/ReadingHistoryEmptyScreen';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import { getLayout } from '../components/layouts/MainLayout';
import {
  READING_HISTORY_QUERY,
  SEARCH_READING_HISTORY_QUERY,
} from '../../shared/src/graphql/users';

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
  const { user, tokenRefreshed } = useContext(AuthContext);
  const searchQuery = router.query?.q?.toString();
  const key = ['readHistory', user?.id];

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

  useEffect(() => {
    if (tokenRefreshed && !user) {
      router.replace('/');
    }
  }, [tokenRefreshed, user]);

  if (!hasData && !isLoading) {
    return (
      <>
        {seo}
        <ReadingHistoryEmptyScreen />
      </>
    );
  }

  return (
    <>
      {seo}
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
        <ReadingHistoryList
          data={data}
          onHide={hideReadHistory}
          infiniteScrollRef={infiniteScrollRef}
        />
        {isLoading && (
          <ReadingHistoryPlaceholder amount={isInitialLoading ? 15 : 1} />
        )}
      </ResponsivePageContainer>
    </>
  );
};

History.getLayout = getLayout;

export default History;
