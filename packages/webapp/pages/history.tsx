import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
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

const History = (): ReactElement => {
  const seo = <NextSeo title="Reading History" nofollow noindex />;
  const router = useRouter();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const key = ['readHistory', user?.id];
  const { hideReadHistory } = useReadingHistory(key);
  const { data, isInitialLoading, isLoading, hasData, infiniteScrollRef } =
    useInfiniteReadingHistory(key);

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
        className={classNames(
          'flex flex-col',
          isInitialLoading && 'h-screen overflow-hidden',
        )}
        style={{ paddingLeft: 0, paddingRight: 0 }}
        aria-busy={isLoading}
        role="main"
      >
        <h1 className="px-6 mb-2 font-bold typo-headline">Reading History</h1>
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
