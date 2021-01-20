import React, { ReactElement } from 'react';
import { ANONYMOUS_FEED_QUERY, FEED_QUERY } from '../graphql/feed';
import MainFeedPage, {
  getMainFeedLayout,
} from '../components/layouts/MainFeedPage';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';

const seo: NextSeoProps = {
  title: 'Popular posts on daily.dev',
};

const Popular = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
      <MainFeedPage query={ANONYMOUS_FEED_QUERY} queryIfLogged={FEED_QUERY} />
    </>
  );
};

Popular.getLayout = getMainFeedLayout;

export default Popular;
