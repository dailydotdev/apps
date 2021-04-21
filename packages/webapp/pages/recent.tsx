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
  title: 'Recently added posts on daily.dev',
  titleTemplate: '%s',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const variables = { ranking: 'TIME' };

const Recent = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
    </>
  );
};

Recent.getLayout = getMainFeedLayout;
Recent.layoutProps = generateMainFeedLayoutProps({
  query: ANONYMOUS_FEED_QUERY,
  queryIfLogged: FEED_QUERY,
  variables,
});

export default Recent;
