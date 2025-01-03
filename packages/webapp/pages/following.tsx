import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../next-seo';
import ProtectedPage from '../components/ProtectedPage';
import { getTemplatedTitle } from '../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Discover posts based on your following'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Explore a personalized feed featuring posts from the sources, Squads, and users you follow. Stay updated with content that matches your interests on daily.dev.',
};

const FollowingFeed = (): ReactElement => (
  <ProtectedPage>
    <></>
  </ProtectedPage>
);

FollowingFeed.getLayout = getMainFeedLayout;
FollowingFeed.layoutProps = { ...mainFeedLayoutProps, seo };

export default FollowingFeed;
