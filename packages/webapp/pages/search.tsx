import React, { ReactElement, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import {
  RenderMarkdown,
  carStoryMarkdownTest,
} from '@dailydotdev/shared/src/components';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const baseSeo: NextSeoProps = {
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

// TODO WT-1554-stream-rendering revert changes in this file
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
      title: 'daily.dev | Where developers grow together',
    };
  }, [query]);

  return (
    <>
      <NextSeo {...seo} {...baseSeo} />
      <RenderMarkdown content={carStoryMarkdownTest} />
    </>
  );
};

// Search.getLayout = ({ children }) => children;
// Search.layoutProps = { ...mainFeedLayoutProps, mobileTitle: 'Search' };

export default Search;
