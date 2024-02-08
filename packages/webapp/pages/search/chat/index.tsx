import React, { ReactElement, useEffect } from 'react';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { SearchExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import { useRouter } from 'next/router';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import SearchV1Page from '../../../components/search/SearchV1Page';
import { GetSearchLayout } from '../../../components/layouts/SearchLayout';

const SearchChatPage = (): ReactElement => {
  const searchVersion = useFeature(feature.search);
  const router = useRouter();

  useEffect(() => {
    if (searchVersion === SearchExperiment.Control) {
      const url = new URL(window.location.href);
      url.pathname = '/search';
      url.searchParams.set('provider', 'posts');

      router.replace(url);
    }
  }, [searchVersion, router]);

  if (searchVersion === SearchExperiment.V1) {
    return <SearchV1Page />;
  }

  return null;
};

SearchChatPage.getLayout = GetSearchLayout;

export default withFeaturesBoundary<unknown, MainLayoutProps>(SearchChatPage);
