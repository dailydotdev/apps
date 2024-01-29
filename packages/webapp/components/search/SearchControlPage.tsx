import React, { ReactElement, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import {
  SearchProviderButton,
  providerToLabelTextMap,
} from '@dailydotdev/shared/src/components';
import { SearchProviderEnum } from '@dailydotdev/shared/src/graphql/search';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { SearchExperiment } from '@dailydotdev/shared/src/lib/featureValues';
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
  const searchVersion = useFeature(feature.search);
  const isSearchV1 = searchVersion === SearchExperiment.V1;

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
      {isSearchV1 && !!query.q && (
        <SearchProviderButton
          className="mt-4"
          provider={SearchProviderEnum.Chat}
          query={query.q as string}
        >
          <span className="text-white">{query.q}</span>
          <span className="ml-2 typo-footnote">
            {providerToLabelTextMap[SearchProviderEnum.Chat]}
          </span>
        </SearchProviderButton>
      )}
    </>
  );
};

Search.getLayout = getMainFeedLayout;
Search.layoutProps = {
  ...mainFeedLayoutProps,
  isFinder: true,
};

export default Search;
