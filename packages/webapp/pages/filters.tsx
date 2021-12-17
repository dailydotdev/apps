import React, { ReactElement } from 'react';
import FilterMenu from '@dailydotdev/shared/src/components/filters/FilterMenu';
import {
  getLayout,
  mainFooterLayoutProps,
} from '../components/layouts/MainFooterLayout';

const FiltersPage = (): ReactElement => (
  <main className="w-full withNavBar">
    <FilterMenu />
  </main>
);

FiltersPage.getLayout = getLayout;
FiltersPage.layoutProps = {
  ...mainFooterLayoutProps,
  mobileTitle: 'Filters',
};

export default FiltersPage;
