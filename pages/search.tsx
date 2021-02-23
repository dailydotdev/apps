import React, { ReactElement, useMemo } from 'react';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
  SEARCH_POSTS_QUERY,
} from '../graphql/feed';
import MainFeedPage, {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { NextSeoProps } from 'next-seo/lib/types';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

const baseSeo: NextSeoProps = {
  titleTemplate: '%s',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Search = (): ReactElement => {
  const router = useRouter();
  const { query } = router;
  const feedProps = useMemo(() => {
    if ('q' in query) {
      return {
        query: SEARCH_POSTS_QUERY,
        variables: { query: query.q.toString() },
      };
    } else {
      return {
        query: ANONYMOUS_FEED_QUERY,
        queryIfLogged: FEED_QUERY,
      };
    }
  }, [query]);

  const seo = useMemo(() => {
    if ('q' in query) {
      return {
        title: `${query.q} - daily.dev search`,
      };
    } else {
      return {
        title: 'daily.dev | All-in-one coding news reader',
      };
    }
  }, [query]);

  return (
    <>
      <NextSeo {...seo} {...baseSeo} />
      <MainFeedPage {...feedProps} />
    </>
  );
};

Search.getLayout = getMainFeedLayout;
Search.layoutProps = mainFeedLayoutProps;

export default Search;
