import React, { ReactElement } from 'react';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: 'Recently added posts on daily.dev',
  titleTemplate: '%s',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Recent = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
    </>
  );
};

Recent.getLayout = getMainFeedLayout;
Recent.layoutProps = mainFeedLayoutProps;

export default Recent;
