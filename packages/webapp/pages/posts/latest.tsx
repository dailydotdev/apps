import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Latest developer posts across all topics'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Explore the latest posts from developers worldwide. Stay current with fresh content on coding, dev tools, tech trends, and more on daily.dev.',
};

const PostsLatest = (): ReactElement => {
  return <NextSeo {...seo} />;
};

PostsLatest.getLayout = getMainFeedLayout;
PostsLatest.layoutProps = { ...mainFeedLayoutProps, seo };

export default PostsLatest;
