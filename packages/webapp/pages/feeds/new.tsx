import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks/useFeedLayout';
import { FeedSettingsCreate } from '@dailydotdev/shared/src/components/feeds/FeedSettings/FeedSettingsCreate';

import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seoTitles = getPageSeoTitles('Create feed');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  ...defaultSeo,
};

const NewFeedPage = (): ReactElement => {
  const { FeedPageLayoutComponent } = useFeedLayout();

  return (
    <FeedPageLayoutComponent>
      <FeedSettingsCreate />
    </FeedPageLayoutComponent>
  );
};

NewFeedPage.getLayout = getMainFeedLayout;
NewFeedPage.layoutProps = { ...mainFeedLayoutProps, seo };

export default NewFeedPage;
