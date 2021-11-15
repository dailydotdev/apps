import React, { ReactElement } from 'react';
import FilterMenu from '@dailydotdev/shared/src/components/filters/FilterMenu';
import { getLayout } from '../components/layouts/FooterNavBarLayout';

const FiltersPage = (): ReactElement => (
  <main className="withNavBar">
    <FilterMenu />
  </main>
);

FiltersPage.getLayout = getLayout;

export default FiltersPage;
