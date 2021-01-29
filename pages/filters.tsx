import React, { ReactElement } from 'react';
import { getLayout } from '../components/layouts/FooterNavBarLayout';
import TagsFilter from '../components/TagsFilter';

const FiltersPage = (): ReactElement => <TagsFilter />;

FiltersPage.getLayout = getLayout;

export default FiltersPage;
