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
  title: getTemplatedTitle('Explore trending developer posts'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Discover the latest trending developer posts from across the web. Stay updated with popular discussions, curated content, and more on daily.dev.',
};

const Posts = (): ReactElement => {
  return <NextSeo {...seo} />;
};

Posts.getLayout = getMainFeedLayout;
Posts.layoutProps = { ...mainFeedLayoutProps, seo };

export default Posts;
