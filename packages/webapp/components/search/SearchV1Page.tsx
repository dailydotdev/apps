import React, { ReactElement } from 'react';
import { NextSeo } from 'next-seo';
import {
  SearchResult,
  SearchSourceList,
} from '@dailydotdev/shared/src/components/search';
import { useChat } from '@dailydotdev/shared/src/hooks';
import { SearchContainer } from '@dailydotdev/shared/src/components/search/SearchContainer';
import { useRouter } from 'next/router';
import { getLayout as getMainLayout } from '../layouts/MainLayout';

const SearchPage = (): ReactElement => {
  const router = useRouter();
  const { data, queryKey, handleSubmit, isLoading } = useChat({
    id: router?.query?.id as string,
    query: router?.query?.q as string,
  });
  const content = data?.chunks?.[0]?.response || '';

  return (
    <SearchContainer
      onSubmit={handleSubmit}
      chunk={data?.chunks?.[0]}
      isLoading={!router?.isReady}
    >
      <NextSeo nofollow noindex />
      {(!!content || !!data) && (
        <>
          <SearchResult
            queryKey={queryKey}
            isInProgress={isLoading}
            chunk={data?.chunks?.[0]}
            searchMessageProps={{ isLoading }}
          />
          <SearchSourceList
            sources={data?.chunks?.[0]?.sources}
            isLoading={isLoading}
          />
        </>
      )}
    </SearchContainer>
  );
};

SearchPage.getLayout = getMainLayout;
SearchPage.layoutProps = { screenCentered: false };

export default SearchPage;
