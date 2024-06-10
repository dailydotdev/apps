import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const seo: NextSeoProps = {
  title: 'Most discussed posts on daily.dev',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const ExploreDiscussed = (): ReactElement => {
  return <NextSeo {...seo} />;
};

ExploreDiscussed.getLayout = getMainFeedLayout;
ExploreDiscussed.layoutProps = mainFeedLayoutProps;

export default ExploreDiscussed;
