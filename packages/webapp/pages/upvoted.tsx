import React, { ReactElement } from 'react';
import { MOST_UPVOTED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import {
  generateMainFeedLayoutProps,
  getMainFeedLayout,
} from '../components/layouts/MainFeedPage';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: 'Most upvoted posts on daily.dev',
  titleTemplate: '%s',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Upvoted = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
    </>
  );
};

Upvoted.getLayout = getMainFeedLayout;
Upvoted.layoutProps = generateMainFeedLayoutProps({
  query: MOST_UPVOTED_FEED_QUERY,
});

export default Upvoted;
