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
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { SearchExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import dynamic from 'next/dynamic';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import GenericFeedItemComponent from '@dailydotdev/shared/src/components/feed/feedItemComponent/GenericFeedItemComponent';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const baseSeo: NextSeoProps = {
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const PostsSearch = dynamic(
  () =>
    import(/* webpackChunkName: "routerPostsSearch" */ '../RouterPostsSearch'),
  { ssr: false },
);

const Search = (): ReactElement => {
  const router = useRouter();
  const { query } = router;
  const searchQuery = query?.q?.toString();
  const { sidebarExpanded } = useSettingsContext();
  const searchVersion = useFeature(feature.search);
  const isV1Search = searchVersion === SearchExperiment.V1;

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
      {isV1Search && !searchQuery && (
        <div
          className={classNames(
            'flex w-full max-w-[32rem] flex-col items-center gap-4  self-center px-6',
            sidebarExpanded ? '!-left-32' : '!-left-6',
          )}
        >
          <MagicIcon
            className="text-theme-label-disabled"
            secondary
            size={IconSize.XXXLarge}
          />
          <h2 className="text-center font-bold text-theme-label-primary typo-title2">
            Ready to dive in?
          </h2>
          <p className="text-center text-theme-label-tertiary typo-callout">
            Start your search to explore a world of developer resources.
          </p>
        </div>
      )}
    </>
  );
};

const AiSearchProviderButton = () => {
  const searchVersion = useFeature(feature.search);
  const router = useRouter();
  const { trackEvent } = useAnalyticsContext();
  const searchQuery = router.query?.q?.toString();
  const { spaciness, insaneMode } = useContext(SettingsContext);
  const currentSettings = useContext(FeedContext);
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const isList = insaneMode && numCards > 1;
  const feedGapPx = getFeedGapPx[gapClass(isList, false, spaciness)];
  const style = {
    '--num-cards': !isList ? numCards : undefined,
    '--feed-gap': `${feedGapPx / 16}rem`,
  } as CSSProperties;

  if (searchVersion === SearchExperiment.Control) {
    return <PostsSearch />;
  }

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
        <span className="text-theme-label-primary">{searchQuery}</span>
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
  feedItemComponent: GenericFeedItemComponent,
  searchChildren: <AiSearchProviderButton />,
};

export default Search;
