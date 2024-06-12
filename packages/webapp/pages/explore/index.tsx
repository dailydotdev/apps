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

const Explore = (): ReactElement => {
  return <NextSeo {...seo} />;
};

Explore.getLayout = getMainFeedLayout;
Explore.layoutProps = mainFeedLayoutProps;

export default Explore;
