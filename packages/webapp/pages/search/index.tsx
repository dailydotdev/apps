import React, { ReactElement } from 'react';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { Features } from '@dailydotdev/shared/src/lib/featureManagement';
import { SearchExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import SearchV1Page from '../../components/search/SearchV1Page';
import SearchControlPage from '../../components/search/SearchControlPage';

const SearchPage = (): ReactElement => {
  const searchVersion = useFeature(Features.Search);

  if (searchVersion === SearchExperiment.V1) {
    return <SearchV1Page />;
  }

  return <SearchControlPage />;
};

SearchPage.getLayout = getMainLayout;
SearchPage.layoutProps = { screenCentered: false };

export default SearchPage;
