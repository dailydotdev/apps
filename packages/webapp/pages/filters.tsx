import React, { ReactElement } from 'react';
import { getLayout } from '../components/layouts/FooterNavBarLayout';
import FeedFilters from '../components/filters/FeedFilters';

const FiltersPage = (): ReactElement => (
  <main className="withNavBar">
    <FeedFilters />
  </main>
);

FiltersPage.getLayout = getLayout;

export default FiltersPage;
