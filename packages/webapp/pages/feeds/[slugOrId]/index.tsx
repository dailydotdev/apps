import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { withExperiment } from '@dailydotdev/shared/src/components/withExperiment';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { CustomFeedsExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import { Redirect } from '@dailydotdev/shared/src/components';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../../components/layouts/MainFeedPage';

const seo: NextSeoProps = {
  title: 'Custom feed',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const FeedPage = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
    </>
  );
};

FeedPage.getLayout = getMainFeedLayout;
FeedPage.layoutProps = mainFeedLayoutProps;

export default withExperiment(FeedPage, {
  feature: feature.customFeeds,
  value: CustomFeedsExperiment.V1,
  fallback: Redirect,
});
