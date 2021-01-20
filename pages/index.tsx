import React, { ReactElement } from 'react';
import { ANONYMOUS_FEED_QUERY, FEED_QUERY } from '../graphql/feed';
import MainFeedPage, {
  getMainFeedLayout,
} from '../components/layouts/MainFeedPage';
import { NextSeoProps } from 'next-seo/lib/types';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import { NextSeo } from 'next-seo';

const seo: NextSeoProps = {
  title: 'daily.dev - News for Busy Developers',
  titleTemplate: '%s',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Home = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
      <MainFeedPage query={ANONYMOUS_FEED_QUERY} queryIfLogged={FEED_QUERY} />
    </>
  );
};

Home.getLayout = getMainFeedLayout;

export default Home;
