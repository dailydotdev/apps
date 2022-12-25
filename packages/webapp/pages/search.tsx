import React, { ReactElement, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { useRouter } from 'next/router';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import WebSeo from '../components/WebSeo';

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
    }
    return {
      title: 'daily.dev | The Homepage Developers Deserve',
    };
  }, [query]);

  return <WebSeo {...seo} {...baseSeo} />;
};

Search.getLayout = getMainFeedLayout;
Search.layoutProps = { ...mainFeedLayoutProps, mobileTitle: 'Search' };

export default Search;
