import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks/useFeedLayout';
import { FeedSettingsCreate } from '@dailydotdev/shared/src/components/feeds/FeedSettings/FeedSettingsCreate';

import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Create feed'),
  openGraph: { ...defaultOpenGraph },
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
