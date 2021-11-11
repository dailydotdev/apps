import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { NextSeo } from 'next-seo';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import useReadingHistory from '@dailydotdev/shared/src/hooks/useReadingHistory';
import MainLayout from '../components/layouts/MainLayout';
import ReadingHistoryList from '../components/ReadingHistoryList';
import ReadingHistoryPlaceholder from '../components/ReadingHistoryPlaceholder';

function History(): ReactElement {
  const {
    data,
    isInitialLoading,
    isLoading,
    hasPages,
    infiniteScrollRef,
    hideReadHistory,
  } = useReadingHistory();

  return (
    <MainLayout additionalButtons>
      <NextSeo title="Reading History" nofollow noindex />
      <ResponsivePageContainer
        className={classNames(
          'flex flex-col',
          isInitialLoading && 'h-screen overflow-hidden',
        )}
        aria-busy={isLoading}
      >
        <h1 className="mb-2 font-bold typo-headline">Reading History</h1>
        {hasPages && (
          <ReadingHistoryList
            itemClassName="-mx-8"
            data={data}
            onHide={hideReadHistory}
            infiniteScrollRef={infiniteScrollRef}
          />
        )}
        {isLoading && (
          <ReadingHistoryPlaceholder
            className="-mx-8"
            amount={isInitialLoading ? 15 : 1}
          />
        )}
      </ResponsivePageContainer>
    </MainLayout>
  );
}

export default History;
