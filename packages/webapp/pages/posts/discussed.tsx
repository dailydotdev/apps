import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seoTitles = getPageSeoTitles('Most discussed developer posts');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Join the conversation with the most discussed posts on daily.dev. See what’s sparking the hottest debates and active discussions among developers.',
};

const PostsDiscussed = (): ReactElement => {
  return <NextSeo {...seo} />;
};

PostsDiscussed.getLayout = getMainFeedLayout;
PostsDiscussed.layoutProps = { ...mainFeedLayoutProps, seo };

export default PostsDiscussed;
