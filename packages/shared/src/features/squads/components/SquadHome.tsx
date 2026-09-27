import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Feed from '../../../components/Feed';
import type { FeedProps } from '../../../components/Feed';
import {
  SEARCH_SOURCE_POSTS_QUERY,
  SOURCE_FEED_QUERY,
  supportedTypesForPrivateSources,
} from '../../../graphql/feed';
import { FeedLayoutProvider } from '../../../contexts/FeedContext';
import { useSearchContextProvider } from '../../../contexts/search/SearchContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useFeedLayout } from '../../../hooks/useFeedLayout';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useSearchId } from '../../../hooks/search/useSearchId';
import { feature } from '../../../lib/featureManagement';
import { OtherFeedPage } from '../../../lib/query';
import { useSquadPageContext } from '../SquadPageContext';
import { isSourceAdFree } from '../../../lib/ads';
import { useSpotlightPageSource } from '../../../components/spotlight/SpotlightContext';
import { getSquadSpotlightSource } from '../lib/spotlight';
import { SquadPageLayout } from './SquadPageLayout';
import { SquadProfileHeader } from './header/SquadProfileHeader';
import { SquadComposer } from './feed/SquadComposer';
import { SquadPinnedPosts } from './feed/SquadPinnedPosts';
import { SquadEmptyFeed } from './feed/SquadEmptyFeed';
import { SquadSearchHeader } from './feed/SquadSearchHeader';
import { SquadProductsShelf } from './products/SquadProductsShelf';

const SearchEmptyScreen = dynamic(
  () =>
    import(
      /* webpackChunkName: "searchEmptyScreen" */ '../../../components/SearchEmptyScreen'
    ),
);

// Two cards a row at most: the feed shares the page with the right column.
const MAX_FEED_COLUMNS = 2;

interface SquadHomeProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export const SquadHome = ({
  searchQuery,
  onClearSearch,
}: SquadHomeProps): ReactElement => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  const { shouldUseListFeedLayout } = useFeedLayout();
  const { postTypesFilter } = useSearchContextProvider();
  const isSearching = searchQuery.length > 0;
  const isAdFree = isSourceAdFree(squad);
  useSpotlightPageSource(getSquadSpotlightSource(squad), {
    query: searchQuery || undefined,
  });
  const { value: searchVersion } = useConditionalFeature({
    feature: feature.searchVersion,
    shouldEvaluate: isSearching,
  });
  const searchId = useSearchId(
    isSearching
      ? [squad.id, searchQuery, searchVersion, postTypesFilter.join(',')].join(
          '|',
        )
      : '',
  );

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (isSearching) {
      return {
        feedName: OtherFeedPage.SearchSquad,
        feedQueryKey: [
          'searchSourcePosts',
          user?.id ?? 'anonymous',
          squad.id,
          searchQuery,
          postTypesFilter,
        ],
        query: SEARCH_SOURCE_POSTS_QUERY,
        variables: {
          source: squad.id,
          query: searchQuery,
          supportedTypes: supportedTypesForPrivateSources,
          postTypes: postTypesFilter,
          version: searchVersion,
        },
        searchId,
        searchVersion,
        emptyScreen: <SearchEmptyScreen />,
      };
    }

    const variables = {
      source: squad.id,
      ranking: 'TIME',
      supportedTypes: supportedTypesForPrivateSources,
    };

    return {
      feedName: OtherFeedPage.Squads,
      feedQueryKey: [
        'sourceFeed',
        user?.id ?? 'anonymous',
        Object.values(variables),
      ],
      query: SOURCE_FEED_QUERY,
      variables,
      emptyScreen: <SquadEmptyFeed />,
      excludePinnedPosts: true,
    };
  }, [
    isSearching,
    postTypesFilter,
    searchId,
    searchQuery,
    searchVersion,
    squad.id,
    user?.id,
  ]);

  const feed = (
    <FeedLayoutProvider maxNumCards={MAX_FEED_COLUMNS}>
      <Feed
        {...feedProps}
        className={classNames(
          'pb-6 pt-4',
          !shouldUseListFeedLayout && 'px-4 tablet:px-6',
        )}
        disableAds={isAdFree}
        showSearch={false}
        options={{ refetchOnMount: true }}
        allowPin
      />
    </FeedLayoutProvider>
  );

  if (isSearching) {
    return (
      <SquadPageLayout
        header={
          <SquadSearchHeader query={searchQuery} onClear={onClearSearch} />
        }
      >
        {feed}
      </SquadPageLayout>
    );
  }

  return (
    <SquadPageLayout header={<SquadProfileHeader />} hasAboutTab>
      <div className="flex flex-col border-border-subtlest-tertiary laptop:border-t">
        <SquadProductsShelf />
        <div className="flex flex-col gap-4 pt-4 tablet:px-6 tablet:pt-6">
          <SquadComposer />
          <SquadPinnedPosts />
        </div>
      </div>
      {feed}
    </SquadPageLayout>
  );
};
