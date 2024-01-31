import React, { ReactElement, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import {
  SearchProviderButton,
  providerToLabelTextMap,
} from '@dailydotdev/shared/src/components';
import { SearchProviderEnum } from '@dailydotdev/shared/src/graphql/search';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import classNames from 'classnames';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../layouts/MainFeedPage';

const baseSeo: NextSeoProps = {
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Search = (): ReactElement => {
  const router = useRouter();
  const { query } = router;
  const searchQuery = query?.q?.toString();
  const { sidebarExpanded } = useSettingsContext();

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
      {!searchQuery && (
        <div
          className={classNames(
            'flex w-full max-w-[32rem] flex-col items-center gap-4  self-center px-6',
            sidebarExpanded ? '!-left-32' : '!-left-6',
          )}
        >
          <MagicIcon
            className="text-overlay-tertiary-salt"
            secondary
            size={IconSize.XXXLarge}
          />
          <h2 className="font-bold text-theme-label-primary typo-title2">
            Ready to dive in?
          </h2>
          <p className="text-theme-label-tertiary typo-callout">
            Start your search to explore a world of developer resources.
          </p>
        </div>
      )}
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
