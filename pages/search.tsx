import React, { ReactElement, useMemo } from 'react';
import { ANONYMOUS_FEED_QUERY, FEED_QUERY } from '../graphql/feed';
import {
  generateMainFeedLayoutProps,
  getMainFeedLayout,
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
    </>
  );
};

Search.getLayout = getMainFeedLayout;
Search.layoutProps = generateMainFeedLayoutProps({
  query: ANONYMOUS_FEED_QUERY,
  queryIfLogged: FEED_QUERY,
});

export default Search;
