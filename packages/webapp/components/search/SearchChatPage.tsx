import React, { ReactElement, useEffect } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import {
  SearchProviderButton,
  SearchResult,
} from '@dailydotdev/shared/src/components/search';
import { useChat } from '@dailydotdev/shared/src/hooks';
import { SearchContainer } from '@dailydotdev/shared/src/components/search/SearchContainer';
import { useRouter } from 'next/router';
import {
  SearchProviderEnum,
  getSearchUrl,
} from '@dailydotdev/shared/src/graphql/search';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { labels } from '@dailydotdev/shared/src/lib';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { getLayout as getMainLayout } from '../layouts/MainLayout';
import { getTemplatedTitle } from '../layouts/utils';

const SearchPage = (): ReactElement => {
  const router = useRouter();
  const { logEvent } = useLogContext();
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

    const newRoute = getSearchUrl({
      id: sessionId,
      provider: SearchProviderEnum.Chat,
    });

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

  const searchedQuery = data?.chunks[0]?.prompt || query;

  return (
    <SearchContainer
      chunk={chunk}
      isLoading={!router?.isReady}
      isInProgress={isLoading}
    >
      <NextSeo {...seo} />
      {(!!content || !!data) && (
        <div className="flex flex-col justify-center">
          <SearchResult
            queryKey={queryKey}
            isInProgress={isLoading}
            chunk={chunk}
            searchMessageProps={{ isLoading }}
          />
          <SearchProviderButton
            className="order-4 mx-auto mt-5 laptop:ml-0"
            provider={SearchProviderEnum.Posts}
            query={searchedQuery}
            onClick={() => {
              logEvent({
                event_name: LogEvent.SwitchSearch,
                extra: JSON.stringify({
                  from: SearchProviderEnum.Chat,
                  to: SearchProviderEnum.Posts,
                  query: searchedQuery,
                }),
              });
            }}
          >
            <span>Search posts on daily.dev instead</span>
          </SearchProviderButton>
        </div>
      )}
    </SearchContainer>
  );
};

SearchPage.getLayout = getMainLayout;
SearchPage.layoutProps = { screenCentered: false };

export default SearchPage;
