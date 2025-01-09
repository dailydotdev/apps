import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../next-seo';
import { getTemplatedTitle } from '../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Most upvoted posts for developers'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Find the most upvoted developer posts on daily.dev. Explore top-rated content in coding, tutorials, and tech news from the largest developer network in the world.',
};

const Upvoted = (): ReactElement => <></>;

Upvoted.getLayout = getMainFeedLayout;
Upvoted.layoutProps = { ...mainFeedLayoutProps, seo };

export default Upvoted;
