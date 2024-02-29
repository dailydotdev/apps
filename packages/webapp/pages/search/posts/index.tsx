import React, { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  SearchProviderEnum,
  getSearchUrl,
} from '@dailydotdev/shared/src/graphql/search';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';
import SearchControlPage from '../../../components/search/SearchPostFinderPage';

const SearchPostsPage = (): ReactElement => {
  const router = useRouter();
  const { id, provider } = router.query;

  useEffect(() => {
    if (id && provider !== SearchProviderEnum.Chat) {
      router.replace(
        getSearchUrl({
          provider: SearchProviderEnum.Chat,
          id: id as string,
        }),
      );
    }
  }, [id, provider, router]);

  return <SearchControlPage />;
};

SearchPostsPage.getLayout = SearchControlPage.getLayout;
SearchPostsPage.layoutProps = SearchControlPage.layoutProps;

export default withFeaturesBoundary<
  unknown,
  typeof SearchControlPage.layoutProps
>(SearchPostsPage);
