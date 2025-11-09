import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

import { MagicIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import classNames from 'classnames';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
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
            'laptop:mt-0 mt-12 flex w-full max-w-[32rem] flex-col items-center gap-4 self-center px-6',
            sidebarExpanded ? '!-left-32' : '!-left-6',
          )}
        >
          <MagicIcon
            className="text-text-disabled"
            secondary
            size={IconSize.XXXLarge}
          />
          <h2 className="text-text-primary typo-title2 text-center font-bold">
            Ready to dive in?
          </h2>
          <p className="text-text-tertiary typo-callout text-center">
            Start your search to explore a world of developer resources.
          </p>
        </div>
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
