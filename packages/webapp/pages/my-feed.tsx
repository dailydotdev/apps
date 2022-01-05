import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: 'My Feed posts on daily.dev',
  titleTemplate: '%s',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const MyFeed = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
    </>
  );
};

MyFeed.getLayout = getMainFeedLayout;
MyFeed.layoutProps = mainFeedLayoutProps;

export default MyFeed;
