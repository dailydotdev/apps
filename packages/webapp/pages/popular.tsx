import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { getMainFeedLayout } from '../components/layouts/MainFeedPage';
import { mainFeedLayoutProps } from '../components/layouts/FeedLayout';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: 'Popular posts on daily.dev',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Popular = (): ReactElement => <></>;

Popular.getLayout = getMainFeedLayout;
Popular.layoutProps = { ...mainFeedLayoutProps, seo };

export default Popular;
