import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: 'Following',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const FollowingFeed = (): ReactElement => <></>;

FollowingFeed.getLayout = getMainFeedLayout;
FollowingFeed.layoutProps = { ...mainFeedLayoutProps, seo };

export default FollowingFeed;
