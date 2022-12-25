import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: 'Popular posts on daily.dev',
  titleTemplate: '%s',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Popular = (): ReactElement => {
  return <></>;
};

Popular.getLayout = getMainFeedLayout;
Popular.layoutProps = { ...mainFeedLayoutProps, seo };

export default Popular;
