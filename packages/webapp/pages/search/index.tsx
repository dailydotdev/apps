import React, { ReactElement } from 'react';
import { NextSeo } from 'next-seo';
import {
  SearchFeedback,
  SearchResult,
  SourceList,
} from '@dailydotdev/shared/src/components/search';
import { SearchBar } from '@dailydotdev/shared/src/components';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';

const SearchPage = (): ReactElement => (
  <main className="m-auto w-full">
    <NextSeo nofollow noindex />
    <div className="grid grid-cols-1 laptop:grid-cols-3 gap-y-6 pt-8 m-auto max-w-screen-laptop">
      <main className="flex flex-col flex-1 col-span-2 px-4 laptop:px-8">
        <SearchBar inputId="search" />
      </main>
      <SearchFeedback />
      <SearchResult />
      <SourceList />
    </div>
  </main>
);

SearchPage.getLayout = getMainLayout;
SearchPage.layoutProps = { screenCentered: false };
export default SearchPage;
