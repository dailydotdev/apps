import React, { ReactElement, useContext } from 'react';
import { NextSeo } from 'next-seo';
import request from 'graphql-request';
import { useInfiniteQuery } from 'react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  ReadHistory,
  READING_HISTORY_QUERY,
} from '@dailydotdev/shared/src/graphql/users';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { RequestDataConnection } from '@dailydotdev/shared/src/graphql/common';
import MainLayout from '../components/layouts/MainLayout';
import ReadingHistoryList from '../components/ReadingHistoryList';

function History(): ReactElement {
  const { user } = useContext(AuthContext);
  const queryKey = ['readHistory', user?.id];
  const queryResult = useInfiniteQuery<
    RequestDataConnection<ReadHistory, 'readHistory'>
  >(
    queryKey,
    (props) =>
      request(`${apiUrl}/graphql`, READING_HISTORY_QUERY, { ...props }),
    {
      getNextPageParam: (lastPage) =>
        lastPage.readHistory.pageInfo.hasNextPage &&
        lastPage.readHistory.pageInfo.endCursor,
    },
  );
  const onHide = async (postId: string, timestamp: Date) => {
    console.log('test');
  };

  const [page] = queryResult?.data?.pages || [];

  return (
    <MainLayout additionalButtons>
      <NextSeo title="Reading History" nofollow noindex />
      <ResponsivePageContainer className="flex flex-col">
        <h1 className="mb-2 font-bold typo-headline">Reading History</h1>
        {page && page.readHistory.edges.length > 0 ? (
          <ReadingHistoryList
            itemClassName="-mx-8"
            queryResult={queryResult}
            onHide={onHide}
          />
        ) : (
          <span>Loading</span>
        )}
      </ResponsivePageContainer>
    </MainLayout>
  );
}

export default History;
