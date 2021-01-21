import React, { ReactElement } from 'react';
import { MOST_UPVOTED_FEED_QUERY } from '../graphql/feed';
import MainFeedPage, {
  getMainFeedLayout,
  mainFeedLayoutProps,
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
      <MainFeedPage query={MOST_UPVOTED_FEED_QUERY} />
    </>
  );
};

Upvoted.getLayout = getMainFeedLayout;
Upvoted.layoutProps = mainFeedLayoutProps;

export default Upvoted;
