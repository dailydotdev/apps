import React, { ReactElement, useEffect } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import { SearchResult } from '@dailydotdev/shared/src/components/search';
import { useChat } from '@dailydotdev/shared/src/hooks';
import { SearchContainer } from '@dailydotdev/shared/src/components/search/SearchContainer';
import { useRouter } from 'next/router';
import { searchPageUrl } from '@dailydotdev/shared/src/graphql/search';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { labels } from '@dailydotdev/shared/src/lib';
import { getLayout as getMainLayout } from '../layouts/MainLayout';
import { getTemplatedTitle } from '../layouts/utils';

const SearchPage = (): ReactElement => {
  const router = useRouter();
  const query = router?.query?.q as string;
  const sessionIdQuery = router?.query?.id as string;
  const { data, isLoading, queryKey, handleSubmit } = useChat({
    id: sessionIdQuery,
  });
  const sessionId = data?.id;
  const chunk = data?.chunks?.[0];
  const content = chunk?.response || '';

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const newRoute = `${searchPageUrl}?id=${sessionId}`;

    router.replace(newRoute, undefined, {
      shallow: true,
    });
    // router reference is not stable https://github.com/vercel/next.js/issues/18127
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    const shouldApplySearchQuery = !!(query && !sessionIdQuery);

    if (!shouldApplySearchQuery) {
      return;
    }

    handleSubmit(undefined, query);
  }, [sessionIdQuery, query, handleSubmit]);

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
      onSubmit={(event, value) => {
        router.push(searchPageUrl, undefined, {
          shallow: true,
        });

        handleSubmit(event, value);
      }}
      chunk={chunk}
      isLoading={!router?.isReady}
    >
      <NextSeo {...seo} />
      {(!!content || !!data) && (
        <SearchResult
          queryKey={queryKey}
          isInProgress={isLoading}
          chunk={chunk}
          searchMessageProps={{ isLoading }}
          className="pt-1.5 mt-6"
        />
      )}
    </SearchContainer>
  );
};

SearchPage.getLayout = getMainLayout;
SearchPage.layoutProps = { screenCentered: false };

export default SearchPage;
