import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';
import { SearchProvider } from '@dailydotdev/shared/src/contexts/search/SearchContext';
import SearchControlPage from '../../../components/search/SearchPostFinderPage';
import MainFeedPage from '../../../components/layouts/MainFeedPage';
import { getLayout } from '../../../components/layouts/FeedLayout';

const SearchPostsPage = (): ReactElement => {
  return <SearchControlPage />;
};

export function getSearchLayout(
  page: ReactNode,
  pageProps,
  layoutProps,
): ReactNode {
  return getLayout(
    <SearchProvider>
      <MainFeedPage {...layoutProps}>{page}</MainFeedPage>
    </SearchProvider>,
    pageProps,
    layoutProps,
  );
}

SearchPostsPage.getLayout = getSearchLayout;
// SearchPostsPage.getLayout = SearchControlPage.getLayout;
SearchPostsPage.layoutProps = SearchControlPage.layoutProps;

export default withFeaturesBoundary<
  unknown,
  typeof SearchControlPage.layoutProps
>(SearchPostsPage);
