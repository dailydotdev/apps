import React, { CSSProperties, ReactElement, useContext, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import {
  SearchProviderButton,
  gapClass,
  getFeedGapPx,
  providerToLabelTextMap,
} from '@dailydotdev/shared/src/components';
import { SearchProviderEnum } from '@dailydotdev/shared/src/graphql/search';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import classNames from 'classnames';
import SettingsContext, {
  useSettingsContext,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import styles from '@dailydotdev/shared/src/components/Feed.module.css';
import FeedContext from '@dailydotdev/shared/src/contexts/FeedContext';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
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
            'mt-12 flex w-full max-w-[32rem] flex-col items-center gap-4 self-center px-6 laptop:mt-0',
            sidebarExpanded ? '!-left-32' : '!-left-6',
          )}
        >
          <MagicIcon
            className="text-text-disabled"
            secondary
            size={IconSize.XXXLarge}
          />
          <h2 className="text-center font-bold text-text-primary typo-title2">
            Ready to dive in?
          </h2>
          <p className="text-center text-text-tertiary typo-callout">
            Start your search to explore a world of developer resources.
          </p>
        </div>
      )}
    </>
  );
};

const AiSearchProviderButton = () => {
  const router = useRouter();
  const { trackEvent } = useAnalyticsContext();
  const searchQuery = router.query?.q?.toString();
  const { spaciness, insaneMode } = useContext(SettingsContext);
  const currentSettings = useContext(FeedContext);
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const isList = insaneMode && numCards > 1;
  const feedGapPx =
    getFeedGapPx[gapClass({ isList, isFeedLayoutV1: false, space: spaciness })];
  const style = {
    '--num-cards': !isList ? numCards : undefined,
    '--feed-gap': `${feedGapPx / 16}rem`,
  } as CSSProperties;

  if (!searchQuery) {
    return null;
  }

  return (
    <div
      className={classNames('mx-auto flex w-full', styles.cards)}
      style={style}
    >
      <SearchProviderButton
        className="mx-auto mb-2 mt-6 laptop:mx-0"
        provider={SearchProviderEnum.Chat}
        query={searchQuery}
        onClick={() => {
          trackEvent({
            event_name: AnalyticsEvent.SwitchSearch,
            extra: JSON.stringify({
              from: SearchProviderEnum.Posts,
              to: SearchProviderEnum.Chat,
              query: searchQuery,
            }),
          });
        }}
      >
        <span className="text-text-primary">{searchQuery}</span>
        <span className="ml-2 typo-footnote">
          {providerToLabelTextMap[SearchProviderEnum.Chat]}
        </span>
      </SearchProviderButton>
    </div>
  );
};

Search.getLayout = getMainFeedLayout;
Search.layoutProps = {
  ...mainFeedLayoutProps,
  isFinder: true,
  searchChildren: <AiSearchProviderButton />,
};

export default Search;
