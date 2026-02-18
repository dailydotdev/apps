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
import NotificationsBell from '../notifications/NotificationsBell';
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

const aiBreakingItems = [
  {
    id: 'news-claude-knowledge-bases',
    label: 'Leak',
    date: 'Feb 5',
    model: 'Opus',
    headline: 'Claude Knowledge Bases spotted in testing',
    summary:
      "New 'Save to knowledge base' button found. Prompt saves reusable info to /mnt/knowledge/ for future conversations.",
  },
  {
    id: 'news-naval-vibe-research',
    label: 'Hot take',
    date: 'Feb 5',
    model: 'General AI',
    headline: "Naval: 'Vibe coding is here. Vibe research is next.'",
    summary: '',
  },
  {
    id: 'news-sam-anthropic-drama',
    label: 'Drama',
    date: 'Feb 4',
    model: 'Codex',
    headline: 'Sam Altman responds to Anthropic Super Bowl ad',
    summary:
      "'The good part: they are funny. But I wonder why Anthropic would go for something so clearly dishonest.' Claims 500K Codex downloads since Monday.",
  },
] as const;

function FeedNav(): ReactElement {
  const router = useRouter();
  const { feedName } = useActiveFeedNameContext();
  const { sortingEnabled } = useSettingsContext();
  const { isSortableFeed } = useFeedName({ feedName });
  const { home, bookmarks } = useActiveNav(feedName);
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

  const shouldRenderNav = home || (isMobile && bookmarks);
  const showAiNewsCarousel = isMobile && isForYouTab;
  if (!shouldRenderNav || router?.pathname?.startsWith('/posts/[id]')) {
    return null;
  }

  return (
    <div
      className="w-full tablet:pl-16"
    >
      {isMobile && <MobileFeedActions />}
      {showAiNewsCarousel && (
        <section className="border-t border-border-subtlest-tertiary bg-gradient-to-b from-background-subtle via-background-default to-background-default px-3 pb-5 pt-3">
          <div className="mx-auto max-w-4xl overflow-visible">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent-ketchup-default" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent-ketchup-default">
                  Breaking
                </span>
              </div>
              <div className="flex items-center gap-1">
                {aiBreakingItems.map((item, index) => (
                  <span
                    key={`ai-news-dot-${item.id}`}
                    className={classNames(
                      'h-1.5 w-1.5 rounded-full border',
                      index === 0
                        ? 'border-text-secondary bg-text-secondary'
                        : 'border-border-subtlest-secondary bg-transparent',
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="no-scrollbar flex w-full snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-visible pr-px">
              {aiBreakingItems.map((item) => (
                <article
                  key={item.id}
                  className="flex h-[112px] w-full min-w-full flex-shrink-0 snap-center flex-col rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-4 bg-accent-ketchup-default px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                        {item.label}
                      </span>
                      <span className="font-mono text-[10px] text-text-quaternary">
                        {item.date}
                      </span>
                    </div>
                    <span className="rounded-4 border border-border-subtlest-secondary bg-transparent px-1 py-0.5 text-[10px] text-text-tertiary">
                      {item.model}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-[14px] text-text-primary">
                    {item.headline} {item.summary}
                  </p>
                </article>
              ))}
            </div>
            <button
              type="button"
              onClick={() => router.push('/ai-coding-hub')}
              className="mt-3 w-full rounded-8 border border-border-subtlest-tertiary bg-transparent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              See all AI news
            </button>
          </div>
        </section>
      )}
      <div
        className={classNames(
          'h-11 bg-background-default relative',
          scrollClassName,
        )}
      >
        <div className="sticky top-0 z-header flex h-11 items-center border-b border-border-subtlest-tertiary bg-background-default">
          <TabContainer
            controlledActive={urlToTab[router.asPath] ?? ''}
            shouldMountInactive
            showBorder={false}
            className={{
              container: 'min-w-0 flex-1',
              header: 'no-scrollbar overflow-x-auto px-2',
            }}
            tabListProps={{
              className: {
                indicator: 'hidden',
              item:
                '!p-0.5 !py-1 !text-[12px] !font-semibold tablet:last-of-type:mr-8',
              },
              autoScrollActive: true,
            }}
            renderTab={({ label, isActive }) => {
              if (label === FeedNavTab.NewFeed) {
                return (
                  <div
                    className={classNames(
                      'flex size-6 items-center justify-center rounded-6 transition-colors',
                      isActive
                        ? 'shadow-sm bg-white text-black'
                        : 'bg-background-subtle text-text-quaternary hover:text-text-secondary',
                    )}
                  >
                    <PlusIcon />
                  </div>
                );
              }

              return (
                <span
                  className={classNames(
                    'whitespace-nowrap rounded-6 px-1 py-0.5 text-[12px] font-semibold transition-colors',
                    isActive
                      ? 'shadow-sm bg-white text-black'
                      : 'text-text-quaternary hover:text-text-secondary',
                  )}
                >
                  {label}
                </span>
              );
            }}
          >
            {Object.entries(urlToTab).map(([url, label]) => (
              <Tab key={`${label}-${url}`} label={label} url={url} />
            ))}
          </TabContainer>

          {showStickyButton && (
            <div className="flex shrink-0 items-center gap-1 px-2">
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
            </div>
          )}
        </div>
        <div className="absolute right-0 top-0 hidden h-[3.25rem] items-center bg-background-default tablet:flex laptop:hidden">
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
