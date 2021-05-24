import React, { ReactElement } from 'react';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { NextSeoProps } from 'next-seo/lib/types';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import { NextSeo, SiteLinksSearchBoxJsonLd } from 'next-seo';

const seo: NextSeoProps = {
  title: 'daily.dev | All-in-one developer news reader',
  titleTemplate: '%s',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Home = (): ReactElement => {
  return (
    <>
      <NextSeo {...seo} />
      <SiteLinksSearchBoxJsonLd
        url="https://app.daily.dev"
        potentialActions={[
          {
            target: 'https://app.daily.dev/search?q',
            queryInput: 'search_term_string',
          },
        ]}
      />
      <a
        href="https://www.producthunt.com/posts/daily-dev-2?utm_source=badge-review&utm_medium=badge&utm_souce=badge-daily-dev-2#discussion-body"
        target="_blank"
      >
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/review.svg?post_id=297063&theme=light"
          alt="daily.dev - All-in-one tech news reader for developers | Product Hunt"
          style={{
            width: '222px',
            height: '48px',
            zIndex: 2,
            bottom: '4.5rem',
          }}
          className="fixed left-4"
        />
      </a>
    </>
  );
};

Home.getLayout = getMainFeedLayout;
Home.layoutProps = mainFeedLayoutProps;

export default Home;
