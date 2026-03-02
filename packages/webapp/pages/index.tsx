import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { SiteLinksSearchBoxJsonLd } from 'next-seo';
import { absoluteWebappUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo, defaultSeoTitle } from '../next-seo';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const baseUrl = absoluteWebappUrl.replace(/\/$/, '');

const Home = (): ReactElement => (
  <SiteLinksSearchBoxJsonLd
    url={baseUrl}
    potentialActions={[
      {
        target: `${baseUrl}/search?q`,
        queryInput: 'search_term_string',
      },
    ]}
  />
);

Home.getLayout = getMainFeedLayout;
Home.layoutProps = { ...mainFeedLayoutProps, seo };

export default Home;
