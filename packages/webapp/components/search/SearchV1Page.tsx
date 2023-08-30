import React, { ReactElement } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import {
  SearchResult,
  SearchSourceList,
} from '@dailydotdev/shared/src/components/search';
import { useChat } from '@dailydotdev/shared/src/hooks';
import { SearchContainer } from '@dailydotdev/shared/src/components/search/SearchContainer';
import { useRouter } from 'next/router';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { labels } from '@dailydotdev/shared/src/lib';
import { getLayout as getMainLayout } from '../layouts/MainLayout';
import { getTemplatedTitle } from '../layouts/utils';

const SearchPage = (): ReactElement => {
  const router = useRouter();
  const query = router?.query?.q as string;
  const { data, queryKey, handleSubmit, isLoading } = useChat({
    id: router?.query?.id as string,
    query,
  });
  const content = data?.chunks?.[0]?.response || '';

  const seo: NextSeoProps = {
    title: getTemplatedTitle(data?.chunks[0]?.prompt || query || 'Search'),
    description: content
      ? content.slice(0, 300)
      : labels.search.shortDescription,
    openGraph: {
      images: [
        {
          url: cloudinary.search.og,
        },
      ],
    },
  };

  return (
    <SearchContainer
      onSubmit={handleSubmit}
      chunk={data?.chunks?.[0]}
      isLoading={!router?.isReady}
    >
      <NextSeo {...seo} />
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
