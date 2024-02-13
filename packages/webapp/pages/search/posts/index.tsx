import React, { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  SearchProviderEnum,
  getSearchUrl,
} from '@dailydotdev/shared/src/graphql/search';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { SearchExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';
import SearchControlPage from '../../../components/search/SearchControlPage';

const SearchPostsPage = (): ReactElement => {
  const searchVersion = useFeature(feature.search);
  const router = useRouter();
  const { id, provider } = router.query;

  useEffect(() => {
    if (searchVersion === SearchExperiment.Control) {
      return;
    }

    if (id && provider !== SearchProviderEnum.Chat) {
      router.replace(
        getSearchUrl({
          provider: SearchProviderEnum.Chat,
          id: id as string,
        }),
      );
    }
  }, [id, provider, router, searchVersion]);

  return <SearchControlPage />;
};

SearchPostsPage.getLayout = SearchControlPage.getLayout;
SearchPostsPage.layoutProps = SearchControlPage.layoutProps;

export default withFeaturesBoundary<
  unknown,
  typeof SearchControlPage.layoutProps
>(SearchPostsPage);
