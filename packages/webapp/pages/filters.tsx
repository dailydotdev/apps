import React, { ReactElement } from 'react';
import FilterMenu from '@dailydotdev/shared/src/components/filters/FilterMenu';
import { NextSeo } from 'next-seo';
import {
  getLayout,
  mainFooterLayoutProps,
} from '../components/layouts/MainFooterLayout';

const FiltersPage = (): ReactElement => (
  <main className="withNavBar w-full">
    <NextSeo title="Filters" nofollow noindex />
    <FilterMenu />
  </main>
);

FiltersPage.getLayout = getLayout;
FiltersPage.layoutProps = {
  ...mainFooterLayoutProps,
};

export default FiltersPage;
