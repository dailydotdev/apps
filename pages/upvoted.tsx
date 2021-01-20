import React, { ReactElement } from 'react';
import { MOST_UPVOTED_FEED_QUERY } from '../graphql/feed';
import MainFeedPage, {
  getMainFeedLayout,
} from '../components/layouts/MainFeedPage';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';

const seo: NextSeoProps = {
  title: 'Most upvoted posts on daily.dev',
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

export default Upvoted;
