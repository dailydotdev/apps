import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Most discussed developer posts'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Join the conversation with the most discussed posts on daily.dev. See what’s sparking the hottest debates and active discussions among developers.',
};

const PostsDiscussed = (): ReactElement => {
  return <NextSeo {...seo} />;
};

PostsDiscussed.getLayout = getMainFeedLayout;
PostsDiscussed.layoutProps = { ...mainFeedLayoutProps, seo };

export default PostsDiscussed;
