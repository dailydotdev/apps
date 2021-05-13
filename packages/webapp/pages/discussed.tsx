import React, { ReactElement } from 'react';
import { MOST_DISCUSSED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import {
  generateMainFeedLayoutProps,
  getMainFeedLayout,
} from '../components/layouts/MainFeedPage';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: 'Most discussed posts on daily.dev',
  titleTemplate: '%s',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Discussed = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
    </>
  );
};

Discussed.getLayout = getMainFeedLayout;
Discussed.layoutProps = generateMainFeedLayoutProps({
  query: MOST_DISCUSSED_FEED_QUERY,
});

export default Discussed;
