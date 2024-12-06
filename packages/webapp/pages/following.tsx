import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import ProtectedPage from '../components/ProtectedPage';

const seo: NextSeoProps = {
  title: 'Following',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const FollowingFeed = (): ReactElement => (
  <ProtectedPage>
    <></>
  </ProtectedPage>
);

FollowingFeed.getLayout = getMainFeedLayout;
FollowingFeed.layoutProps = { ...mainFeedLayoutProps, seo };

export default FollowingFeed;
