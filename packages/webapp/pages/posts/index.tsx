import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../../next-seo';

const seo: NextSeoProps = {
  title: 'Explore | daily.dev',
  openGraph: { ...defaultOpenGraph },
  description:
    'Discover the most popular posts and discussions on daily.dev. Explore trending topics and join conversations with fellow developers to stay ahead in the tech world.',
};

const Posts = (): ReactElement => {
  return <NextSeo {...seo} />;
};

Posts.getLayout = getMainFeedLayout;
Posts.layoutProps = mainFeedLayoutProps;

export default Posts;
