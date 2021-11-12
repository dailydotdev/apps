import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { NextSeo } from 'next-seo';
import { ResponsiveNoPaddingPageContainer } from '@dailydotdev/shared/src/components/utilities';
import useReadingHistory from '@dailydotdev/shared/src/hooks/useReadingHistory';
import ReadingHistoryList from '@dailydotdev/shared/src/components/history/ReadingHistoryList';
import ReadingHistoryPlaceholder from '@dailydotdev/shared/src/components/history/ReadingHistoryPlaceholder';
import ReadingHistoryEmptyScreen from '@dailydotdev/shared/src/components/history/ReadingHistoryEmptyScreen';
import { getLayout } from '../components/layouts/MainLayout';

const History = (): ReactElement => {
  const {
    data,
    isInitialLoading,
    isLoading,
    hasData,
    infiniteScrollRef,
    hideReadHistory,
  } = useReadingHistory();
  const seo = <NextSeo title="Reading History" nofollow noindex />;

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
      <ResponsiveNoPaddingPageContainer
        className={classNames(
          'flex flex-col',
          isInitialLoading && 'h-screen overflow-hidden',
        )}
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
      </ResponsiveNoPaddingPageContainer>
    </>
  );
};

History.getLayout = getLayout;

export default History;
