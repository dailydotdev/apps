import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import React, { ReactElement } from 'react';

import { GetSearchLayout } from '../../../components/layouts/SearchLayout';
import SearchPage from '../../../components/search/SearchChatPage';

const SearchChatPage = (): ReactElement => {
  return <SearchPage />;
};

SearchChatPage.getLayout = GetSearchLayout;

export default withFeaturesBoundary<unknown, MainLayoutProps>(SearchChatPage);
