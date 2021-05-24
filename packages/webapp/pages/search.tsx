import React, { ReactElement, useMemo } from 'react';
import {
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

  const seo = useMemo(() => {
    if ('q' in query) {
      return {
        title: `${query.q} - daily.dev search`,
      };
    } else {
      return {
        title: 'daily.dev | All-in-one developer news reader',
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
Search.layoutProps = mainFeedLayoutProps;

export default Search;
