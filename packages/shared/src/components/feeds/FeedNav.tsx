import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Tab, TabContainer } from '../tabs/TabContainer';
import { useActiveFeedNameContext } from '../../contexts';
import useActiveNav from '../../hooks/useActiveNav';
import { useFeeds, useViewSize, ViewSize } from '../../hooks';
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
import { formatKeyword } from '../../lib/strings';
import NotificationsBell from '../notifications/NotificationsBell';
import classed from '../../lib/classed';
import { OtherFeedPage } from '../../lib/query';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { useSortedFeeds } from '../../hooks/feed/useSortedFeeds';
import MyFeedHeading from '../filters/MyFeedHeading';
import { SharedFeedPage } from '../utilities';
import PlusMobileEntryBanner from '../banners/PlusMobileEntryBanner';
import { TargetType } from '../../lib/log';
import usePlusEntry from '../../hooks/usePlusEntry';

enum FeedNavTab {
  ForYou = 'For you',
  Popular = 'Popular',
  AgenticHub = 'Agentic Hub',
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

type FeedNavTabEntry = {
  label: string;
  url: string;
};

const StickyNavIconWrapper = classed(
  'div',
  'sticky flex h-14 pt-1 -translate-y-16 items-center justify-end bg-gradient-to-r from-transparent via-background-default via-40% to-background-default pr-4',
);

const getCustomFeedTabLabel = ({
  id,
  slug,
  flags,
}: {
  id: string;
  slug?: string;
  flags?: { name?: string };
}): string => {
  if (flags?.name) {
    return flags.name;
  }

  if (slug && slug !== id) {
    return formatKeyword(slug);
  }

  return `Feed ${id}`;
};

function FeedNav(): ReactElement | null {
  const router = useRouter();
  const { feedName } = useActiveFeedNameContext();
  const activeFeedName = feedName ?? SharedFeedPage.MyFeed;
  const { sortingEnabled } = useSettingsContext();
  const { isSortableFeed } = useFeedName({ feedName: activeFeedName });
  const { home, bookmarks } = useActiveNav(activeFeedName);
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
  const { plusEntryForYou } = usePlusEntry();
  const showStickyButton =
    isMobile &&
    ((sortingEnabled && isSortableFeed) ||
      activeFeedName === SharedFeedPage.Custom);

  const customFeedTabs = useMemo<FeedNavTabEntry[]>(() => {
    return sortedFeeds.map(({ node: feed }) => {
      const isMatchingRoute =
        router.query.slugOrId === feed.id ||
        router.query.slugOrId === feed.slug;
      const isEditingFeed =
        isMatchingRoute && router.pathname.endsWith('/edit');
      const feedLabel = getCustomFeedTabLabel(feed);
      let feedPath = `${webappUrl}feeds/${feed.id}`;

      if (!isEditingFeed && isCustomDefaultFeed && feed.id === defaultFeedId) {
        feedPath = webappUrl;
      }

      return {
        label: feedLabel,
        url: `${feedPath}${isEditingFeed ? '/edit' : ''}`,
      };
    });
  }, [
    sortedFeeds,
    router.query.slugOrId,
    router.pathname,
    defaultFeedId,
    isCustomDefaultFeed,
  ]);

  const urlToTab: Record<string, string> = useMemo(() => {
    const forYouTab = isCustomDefaultFeed ? `${webappUrl}my-feed` : webappUrl;
    const customFeedAliases = sortedFeeds.reduce((acc, { node: feed }) => {
      const feedLabel = getCustomFeedTabLabel(feed);
      const isDefaultCustomFeed =
        isCustomDefaultFeed && feed.id === defaultFeedId;
      const canonicalPath = isDefaultCustomFeed
        ? webappUrl
        : `${webappUrl}feeds/${feed.id}`;
      const slugPath =
        feed.slug && feed.slug !== feed.id
          ? `${webappUrl}feeds/${feed.slug}`
          : undefined;

      acc[canonicalPath] = feedLabel;
      acc[`${canonicalPath}/edit`] = feedLabel;

      if (slugPath) {
        acc[slugPath] = feedLabel;
        acc[`${slugPath}/edit`] = feedLabel;
      }

      return acc;
    }, {} as Record<string, string>);

    return {
      [`${webappUrl}feeds/new`]: FeedNavTab.NewFeed,
      [forYouTab]: FeedNavTab.ForYou,
      [`${webappUrl}posts`]: FeedNavTab.Popular,
      [`${webappUrl}agents`]: FeedNavTab.AgenticHub,
      ...customFeedAliases,
      [`${webappUrl}following`]: FeedNavTab.Following,
      [`${webappUrl}${OtherFeedPage.Discussed}`]: FeedNavTab.Discussions,
      [`${webappUrl}tags`]: FeedNavTab.Tags,
      [`${webappUrl}sources`]: FeedNavTab.Sources,
      [`${webappUrl}users`]: FeedNavTab.Leaderboard,
      [`${webappUrl}bookmarks`]: FeedNavTab.Bookmarks,
      [`${webappUrl}history`]: FeedNavTab.History,
    };
  }, [sortedFeeds, defaultFeedId, isCustomDefaultFeed]);

  const tabs = useMemo<FeedNavTabEntry[]>(
    () => [
      { label: FeedNavTab.NewFeed, url: `${webappUrl}feeds/new` },
      {
        label: FeedNavTab.ForYou,
        url: isCustomDefaultFeed ? `${webappUrl}my-feed` : webappUrl,
      },
      { label: FeedNavTab.Popular, url: `${webappUrl}posts` },
      { label: FeedNavTab.AgenticHub, url: `${webappUrl}agents` },
      ...customFeedTabs,
      { label: FeedNavTab.Following, url: `${webappUrl}following` },
      {
        label: FeedNavTab.Discussions,
        url: `${webappUrl}${OtherFeedPage.Discussed}`,
      },
      { label: FeedNavTab.Tags, url: `${webappUrl}tags` },
      { label: FeedNavTab.Sources, url: `${webappUrl}sources` },
      { label: FeedNavTab.Leaderboard, url: `${webappUrl}users` },
      { label: FeedNavTab.Bookmarks, url: `${webappUrl}bookmarks` },
      { label: FeedNavTab.History, url: `${webappUrl}history` },
    ],
    [customFeedTabs, isCustomDefaultFeed],
  );

  const shouldRenderNav = home || (isMobile && bookmarks);
  if (!shouldRenderNav || router?.pathname?.startsWith('/posts/[id]')) {
    return null;
  }

  return (
    <div
      className={classNames(
        'sticky top-0 z-header w-full bg-background-default tablet:pl-16',
        scrollClassName,
      )}
    >
      {isMobile && <MobileFeedActions />}
      <div className="mb-4 h-[3.25rem] tablet:relative tablet:mb-0 tablet:h-auto tablet:min-h-[3.25rem]">
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
          {tabs.map(({ label, url }) => (
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
        <div className="hidden items-center bg-background-default tablet:absolute tablet:inset-y-0 tablet:right-0 tablet:flex laptop:hidden">
          <NotificationsBell compact />
        </div>
      </div>
      {isForYouTab && plusEntryForYou && (
        <PlusMobileEntryBanner
          targetType={TargetType.PlusEntryForYouTab}
          className="-mt-4"
          arrow
          {...plusEntryForYou}
        />
      )}
    </div>
  );
}

export default FeedNav;
