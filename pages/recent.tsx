import React, { ReactElement } from 'react';
import { ANONYMOUS_FEED_QUERY, FEED_QUERY } from '../graphql/feed';
import MainFeedPage, {
  getMainFeedLayout,
} from '../components/layouts/MainFeedPage';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';

const seo: NextSeoProps = {
  title: 'Recently added posts on daily.dev',
};

const Recent = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
      <MainFeedPage
        query={ANONYMOUS_FEED_QUERY}
        queryIfLogged={FEED_QUERY}
        variables={{ ranking: 'TIME' }}
      />
    </>
  );
};

Recent.getLayout = getMainFeedLayout;

export default Recent;
