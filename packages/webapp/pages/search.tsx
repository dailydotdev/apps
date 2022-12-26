import React, { ReactElement, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';

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

  return (
    <>
      <NextSeo {...seo} {...baseSeo} />
    </>
  );
};

Search.getLayout = getMainFeedLayout;
Search.layoutProps = { ...mainFeedLayoutProps, mobileTitle: 'Search' };

export default Search;
