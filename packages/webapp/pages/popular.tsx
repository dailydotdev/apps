import React, { ReactElement } from 'react';
import { ANONYMOUS_FEED_QUERY, FEED_QUERY } from '../graphql/feed';
import {
  generateMainFeedLayoutProps,
  getMainFeedLayout,
} from '../components/layouts/MainFeedPage';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: 'Popular posts on daily.dev',
  titleTemplate: '%s',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Popular = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
    </>
  );
};

Popular.getLayout = getMainFeedLayout;
Popular.layoutProps = generateMainFeedLayoutProps({
  query: ANONYMOUS_FEED_QUERY,
  queryIfLogged: FEED_QUERY,
});

export default Popular;
