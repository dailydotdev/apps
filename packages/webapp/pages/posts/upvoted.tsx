import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const seo: NextSeoProps = {
  title: 'Most upvoted posts on daily.dev',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const PostsUpvoted = (): ReactElement => {
  return <NextSeo {...seo} />;
};

PostsUpvoted.getLayout = getMainFeedLayout;
PostsUpvoted.layoutProps = { ...mainFeedLayoutProps, seo };

export default PostsUpvoted;
