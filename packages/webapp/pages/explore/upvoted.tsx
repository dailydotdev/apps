import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const seo: NextSeoProps = {
  title: 'Popular posts on daily.dev',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const ExploreUpvoted = (): ReactElement => {
  return <NextSeo {...seo} />;
};

ExploreUpvoted.getLayout = getMainFeedLayout;
ExploreUpvoted.layoutProps = mainFeedLayoutProps;

export default ExploreUpvoted;
