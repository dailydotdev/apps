import { NextSeo, NextSeoProps } from 'next-seo';
import React, { ReactElement } from 'react';
import GenericFeedItemComponent from '@dailydotdev/shared/src/components/feed/feedItemComponent/genericFeedItemComponent';
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

const MyFeed = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
      <div>Some special extra</div>
    </>
  );
};

MyFeed.getLayout = getMainFeedLayout;
MyFeed.layoutProps = {
  ...mainFeedLayoutProps,
  feedItemComponent: GenericFeedItemComponent,
};

export default MyFeed;
