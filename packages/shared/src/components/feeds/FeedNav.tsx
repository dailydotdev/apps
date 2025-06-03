import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/router';
import { Tab, TabContainer } from '../tabs/TabContainer';
import { useActiveFeedNameContext } from '../../contexts';
import useActiveNav from '../../hooks/useActiveNav';
import {
  useBoot,
  useConditionalFeature,
  useEventListener,
  useFeeds,
  useViewSize,
  ViewSize,
} from '../../hooks';
import usePersistentContext from '../../hooks/usePersistentContext';
import {
  algorithmsList,
  DEFAULT_ALGORITHM_INDEX,
  DEFAULT_ALGORITHM_KEY,
} from '../layout/common';
import { MobileFeedActions } from './MobileFeedActions';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { Dropdown } from '../fields/Dropdown';
import { PlusIcon, SortIcon } from '../icons';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { webappUrl } from '../../lib/constants';
import NotificationsBell from '../notifications/NotificationsBell';
import classed from '../../lib/classed';
import { OtherFeedPage } from '../../lib/query';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { useSortedFeeds } from '../../hooks/feed/useSortedFeeds';
import MyFeedHeading from '../filters/MyFeedHeading';
import { SharedFeedPage } from '../utilities';
import PlusMobileEntryBanner from '../banners/PlusMobileEntryBanner';
import { MarketingCtaVariant } from '../marketingCta/common';
import { featurePlusEntryMobile } from '../../lib/featureManagement';
import { TargetType } from '../../lib/log';

enum FeedNavTab {
  ForYou = 'For you',
  Popular = 'Popular',
  Explore = 'Explore',
  Tags = 'Tags',
  Sources = 'Sources',
  Leaderboard = 'Leaderboard',
  Bookmarks = 'Bookmarks',
  History = 'History',
  Discussions = 'Discussions',
  NewFeed = 'Custom feed',
  Following = 'Following',
}

const StickyNavIconWrapper = classed(
  'div',
  'sticky flex h-11 -translate-y-12 items-center justify-end bg-gradient-to-r from-transparent via-background-default via-40% to-background-default pr-4',
);

const MIN_SCROLL_BEFORE_HIDING = 60;

function FeedNav(): ReactElement {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const { feedName } = useActiveFeedNameContext();
  const { sortingEnabled } = useSettingsContext();
  const { isSortableFeed } = useFeedName({ feedName });
  const { home: shouldRenderNav } = useActiveNav(feedName);
  const isMobile = useViewSize(ViewSize.MobileL);
  const [selectedAlgo, setSelectedAlgo] = usePersistentContext(
    DEFAULT_ALGORITHM_KEY,
    DEFAULT_ALGORITHM_INDEX,
    [0, 1],
    DEFAULT_ALGORITHM_INDEX,
  );
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });
  const { feeds } = useFeeds();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const sortedFeeds = useSortedFeeds({ edges: feeds?.edges });
  const isForYouTab =
    router.pathname === webappUrl || router.pathname === `${webappUrl}my-feed`;
  const { getMarketingCta } = useBoot();
  const forYouTabEntry = getMarketingCta(MarketingCtaVariant.PlusForYouTab);
  const { value: plusEntryExp } = useConditionalFeature({
    feature: featurePlusEntryMobile,
    shouldEvaluate: isForYouTab && isMobile && !!forYouTabEntry,
  });

  const showStickyButton =
    isMobile &&
    ((sortingEnabled && isSortableFeed) || feedName === SharedFeedPage.Custom);

  const urlToTab: Record<string, FeedNavTab> = useMemo(() => {
    const customFeeds = sortedFeeds.reduce((acc, { node: feed }) => {
      const isEditingFeed =
        router.query.slugOrId === feed.id && router.pathname.endsWith('/edit');
      let feedPath = `${webappUrl}feeds/${feed.id}`;

      if (!isEditingFeed && isCustomDefaultFeed && feed.id === defaultFeedId) {
        feedPath = `${webappUrl}`;
      }

      const urlPath = `${feedPath}${isEditingFeed ? '/edit' : ''}`;

      acc[urlPath] = feed.flags?.name || `Feed ${feed.id}`;

      return acc;
    }, {});

    const forYouTab = isCustomDefaultFeed ? `${webappUrl}my-feed` : webappUrl;

    const urls = {
      [`${webappUrl}feeds/new`]: FeedNavTab.NewFeed,
      [forYouTab]: FeedNavTab.ForYou,
      ...customFeeds,
    };

    return {
      ...urls,
      [`${webappUrl}following`]: FeedNavTab.Following,
      [`${webappUrl}${OtherFeedPage.Discussed}`]: FeedNavTab.Discussions,
      [`${webappUrl}tags`]: FeedNavTab.Tags,
      [`${webappUrl}sources`]: FeedNavTab.Sources,
      [`${webappUrl}users`]: FeedNavTab.Leaderboard,
      [`${webappUrl}bookmarks`]: FeedNavTab.Bookmarks,
      [`${webappUrl}history`]: FeedNavTab.History,
    };
  }, [
    sortedFeeds,
    router.query.slugOrId,
    router.pathname,
    defaultFeedId,
    isCustomDefaultFeed,
  ]);

  const previousScrollY = React.useRef(0);

  useEventListener(globalThis, 'scroll', () => {
    // when scrolled down we should hide the header
    // when scrolled up, we should bring it back
    const { scrollY } = window;
    const shouldHeaderBeVisible = scrollY < previousScrollY.current;

    previousScrollY.current = scrollY;

    if (shouldHeaderBeVisible === isHeaderVisible) {
      return;
    }

    if (!shouldHeaderBeVisible && scrollY < MIN_SCROLL_BEFORE_HIDING) {
      return;
    }

    startTransition(() => {
      setIsHeaderVisible(shouldHeaderBeVisible);
    });
  });

  if (!shouldRenderNav || router?.pathname?.startsWith('/posts/[id]')) {
    return null;
  }

  return (
    <div
      className={classNames(
        'sticky top-0 z-header w-full transition-transform tablet:pl-16',
        scrollClassName,
        isHeaderVisible
          ? 'translate-y-0 duration-200'
          : '-translate-y-26 duration-[800ms]',
      )}
    >
      {isMobile && <MobileFeedActions />}
      <div className="mb-4 h-[3.25rem] tablet:mb-0">
        <TabContainer
          controlledActive={urlToTab[router.asPath] ?? ''}
          shouldMountInactive
          className={{
            header: classNames(
              'no-scrollbar overflow-x-auto px-2',
              isSortableFeed && sortingEnabled && 'pr-28',
            ),
          }}
          tabListProps={{
            className: {
              indicator: '!w-6',
              item: 'px-1 tablet:last-of-type:mr-12',
            },
            autoScrollActive: true,
          }}
          renderTab={({ label }) => {
            if (label === FeedNavTab.NewFeed) {
              return (
                <div className="flex size-6 items-center justify-center rounded-6 bg-background-subtle">
                  <PlusIcon />
                </div>
              );
            }

            return null;
          }}
        >
          {Object.entries(urlToTab).map(([url, label]) => (
            <Tab key={`${label}-${url}`} label={label} url={url} />
          ))}
        </TabContainer>

        {showStickyButton && (
          <StickyNavIconWrapper
            className={classNames(
              'translate-x-[calc(100vw-100%)]',
              sortingEnabled && isSortableFeed ? 'w-32' : 'w-20',
            )}
          >
            {sortingEnabled && isSortableFeed && (
              <Dropdown
                className={{
                  label: 'hidden',
                  chevron: 'hidden',
                  button: '!px-1',
                }}
                dynamicMenuWidth
                shouldIndicateSelected
                buttonSize={ButtonSize.Small}
                buttonVariant={ButtonVariant.Tertiary}
                icon={<SortIcon />}
                iconOnly
                selectedIndex={selectedAlgo}
                options={algorithmsList}
                onChange={(_, index) => setSelectedAlgo(index)}
                drawerProps={{ displayCloseButton: true }}
              />
            )}

            <MyFeedHeading />
          </StickyNavIconWrapper>
        )}
        <StickyNavIconWrapper className="hidden translate-x-[calc(100vw-180%)] tablet:flex laptop:hidden">
          <NotificationsBell compact />
        </StickyNavIconWrapper>
      </div>
      {plusEntryExp && (
        <PlusMobileEntryBanner
          targetType={TargetType.PlusEntryForYouTab}
          className="-mt-4"
          arrow
          {...forYouTabEntry}
        />
      )}
    </div>
  );
}

export default FeedNav;
