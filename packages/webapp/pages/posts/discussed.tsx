import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const seo: NextSeoProps = {
  title: 'Most discussed posts on daily.dev',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const PostsDiscussed = (): ReactElement => {
  return <NextSeo {...seo} />;
};

PostsDiscussed.getLayout = getMainFeedLayout;
PostsDiscussed.layoutProps = mainFeedLayoutProps;

export default PostsDiscussed;
