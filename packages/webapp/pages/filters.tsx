import React, { ReactElement } from 'react';
import FeedFilters from '@dailydotdev/shared/src/components/filters/FeedFilters';
import { getLayout } from '../components/layouts/FooterNavBarLayout';

const FiltersPage = (): ReactElement => (
  <main className="withNavBar">
    <FeedFilters />
  </main>
);

FiltersPage.getLayout = getLayout;

export default FiltersPage;
