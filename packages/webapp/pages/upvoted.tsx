import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: 'Most upvoted posts on daily.dev',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Upvoted = (): ReactElement => {
  return <></>;
};

Upvoted.getLayout = getMainFeedLayout;
Upvoted.layoutProps = { ...mainFeedLayoutProps, seo };

export default Upvoted;
