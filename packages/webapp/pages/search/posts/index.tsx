import type { ReactElement } from 'react';
import React from 'react';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';
import SearchControlPage from '../../../components/search/SearchPostFinderPage';

const SearchPostsPage = (): ReactElement => {
  return <SearchControlPage />;
};

SearchPostsPage.getLayout = SearchControlPage.getLayout;
SearchPostsPage.layoutProps = SearchControlPage.layoutProps;

export default withFeaturesBoundary<
  unknown,
  typeof SearchControlPage.layoutProps
>(SearchPostsPage);
