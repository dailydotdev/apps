import React, { ReactElement } from 'react';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import SearchV1Page from '../../../components/search/SearchV1Page';
import { GetSearchLayout } from '../../../components/layouts/SearchLayout';

const SearchChatPage = (): ReactElement => {
  return <SearchV1Page />;
};

SearchChatPage.getLayout = GetSearchLayout;

export default withFeaturesBoundary<unknown, MainLayoutProps>(SearchChatPage);
