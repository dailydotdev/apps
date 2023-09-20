import React, { ReactElement } from 'react';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { SearchExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import SearchV1Page from '../../components/search/SearchV1Page';
import SearchControlPage from '../../components/search/SearchControlPage';
import { GetSearchLayout } from '../../components/layouts/SearchLayout';

const SearchPage = (): ReactElement => {
  const searchVersion = useFeature(feature.search);

  if (searchVersion === SearchExperiment.V1) {
    return <SearchV1Page />;
  }

  return <SearchControlPage />;
};

SearchPage.getLayout = GetSearchLayout;

export default SearchPage;
