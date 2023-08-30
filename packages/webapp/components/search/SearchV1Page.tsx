import React, { ReactElement, useEffect } from 'react';
import { NextSeo } from 'next-seo';
import {
  SearchResult,
  SearchSourceList,
} from '@dailydotdev/shared/src/components/search';
import { useChat } from '@dailydotdev/shared/src/hooks';
import { SearchContainer } from '@dailydotdev/shared/src/components/search/SearchContainer';
import { useRouter } from 'next/router';
import { searchPageUrl } from '@dailydotdev/shared/src/graphql/search';
import { getLayout as getMainLayout } from '../layouts/MainLayout';

const SearchPage = (): ReactElement => {
  const router = useRouter();
  const query = router?.query?.q as string;
  const sessionId = router?.query?.id as string;
  const { data, isLoading, queryKey, handleSubmit } = useChat({
    id: sessionId,
  });
  const searchId = data?.id;
  const chunk = data?.chunks?.[0];
  const content = chunk?.response || '';

  useEffect(() => {
    if (!searchId) {
      return;
    }

    const newRoute = `${searchPageUrl}?id=${searchId}`;

    router.replace(newRoute, undefined, {
      shallow: true,
    });
    // router reference is not stable https://github.com/vercel/next.js/issues/18127
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchId]);

  useEffect(() => {
    const shouldApplySearchQuery = !!(query && !searchId);

    if (!shouldApplySearchQuery) {
      return;
    }

    handleSubmit(undefined, query);
  }, [searchId, query, handleSubmit]);

  return (
    <SearchContainer
      onSubmit={(event, value) => {
        router.push(searchPageUrl, undefined, {
          shallow: true,
        });

        handleSubmit(event, value);
      }}
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
