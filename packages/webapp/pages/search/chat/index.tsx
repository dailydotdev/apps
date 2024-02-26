import React, { ReactElement } from 'react';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import SearchPage from '../../../components/search/SearchChatPage';
import { GetSearchLayout } from '../../../components/layouts/SearchLayout';

const SearchChatPage = (): ReactElement => {
  return <SearchPage />;
};

SearchChatPage.getLayout = GetSearchLayout;

export default withFeaturesBoundary<unknown, MainLayoutProps>(SearchChatPage);
