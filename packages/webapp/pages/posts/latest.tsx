import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const seo: NextSeoProps = {
  title: 'Latest posts on daily.dev',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const PostsLatest = (): ReactElement => {
  return <NextSeo {...seo} />;
};

PostsLatest.getLayout = getMainFeedLayout;
PostsLatest.layoutProps = mainFeedLayoutProps;

export default PostsLatest;
