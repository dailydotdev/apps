import React, { ReactElement } from 'react';
import { getLayout } from '../components/layouts/FooterNavBarLayout';
import TagsFilter from '../components/TagsFilter';

const FiltersPage = (): ReactElement => (
  <main>
    <TagsFilter />
  </main>
);

FiltersPage.getLayout = getLayout;

export default FiltersPage;
