import React, { ReactElement, useEffect, useMemo, useState } from 'react';
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
  const [timeoutHandle, setTimeoutHandle] = useState<number>(null);
  const [throttledQuery, setThrottledQuery] = useState<string>(
    query.q?.toString(),
  );
  const feedProps = useMemo(() => {
    if (throttledQuery) {
      return {
        query: SEARCH_POSTS_QUERY,
        variables: { query: throttledQuery },
      };
    } else {
      return {
        query: ANONYMOUS_FEED_QUERY,
        queryIfLogged: FEED_QUERY,
      };
    }
  }, [throttledQuery]);

  const seo = useMemo(() => {
    if (throttledQuery) {
      return {
        title: `${throttledQuery} - daily.dev search`,
      };
    } else {
      return {
        title: 'daily.dev | All-in-one coding news reader',
      };
    }
  }, [throttledQuery]);

  useEffect(() => {
    if ('q' in query && !throttledQuery) {
      setThrottledQuery(query.q.toString());
    } else if ('q' in query && throttledQuery) {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      setTimeoutHandle(
        window.setTimeout(() => setThrottledQuery(query.q.toString()), 500),
      );
    } else {
      setThrottledQuery(null);
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
