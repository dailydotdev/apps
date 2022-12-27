import { NextSeo, NextSeoProps } from 'next-seo';
import React, { ReactElement } from 'react';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: 'My feed',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const MyFeed = (): ReactElement => <NextSeo {...seo} />;

MyFeed.getLayout = getMainFeedLayout;
MyFeed.layoutProps = mainFeedLayoutProps;

export default MyFeed;
