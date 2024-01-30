import React, { ReactElement, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import {
  SearchProviderButton,
  providerToLabelTextMap,
} from '@dailydotdev/shared/src/components';
import { SearchProviderEnum } from '@dailydotdev/shared/src/graphql/search';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const baseSeo: NextSeoProps = {
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Search = (): ReactElement => {
  const router = useRouter();
  const { query } = router;

  const seo = useMemo(() => {
    if ('q' in query) {
      return {
        title: `${query.q} - daily.dev post finder`,
      };
    }
    return {
      title: 'daily.dev | Where developers grow together',
    };
  }, [query]);

  return (
    <>
      <NextSeo {...seo} {...baseSeo} />
    </>
  );
};

const AiSearchProviderButton = () => {
  const router = useRouter();
  const searchQuery = router.query?.q?.toString();

  if (!searchQuery) {
    return null;
  }

  return (
    <SearchProviderButton
      className="mx-auto mt-6 laptop:mx-0"
      provider={SearchProviderEnum.Chat}
      query={searchQuery}
    >
      <span className="text-white">{searchQuery}</span>
      <span className="ml-2 typo-footnote">
        {providerToLabelTextMap[SearchProviderEnum.Chat]}
      </span>
    </SearchProviderButton>
  );
};

Search.getLayout = getMainFeedLayout;
Search.layoutProps = {
  ...mainFeedLayoutProps,
  isFinder: true,
  searchChildren: <AiSearchProviderButton />,
};

export default Search;
