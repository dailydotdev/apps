import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Tab, TabContainer } from '../tabs/TabContainer';
import UnifiedMobileFeedNav from './UnifiedMobileFeedNav';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import {
  FeedChipsVariant,
  featureFeedChips,
} from '../../lib/featureManagement';
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
import { CopyMyFeedButton } from './CopyMyFeedButton';
import { useCopyMyFeedEnabled } from '../../hooks/feed/useCopyMyFeedEnabled';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { Dropdown } from '../fields/Dropdown';
import { PlusIcon, SortIcon } from '../icons';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { webappUrl } from '../../lib/constants';
import NotificationsBell from '../notifications/NotificationsBell';
import { GivebackGiftEntry } from '../../features/giveback/components/GivebackGiftEntry';
import classed from '../../lib/classed';
import type { AllFeedPages } from '../../lib/query';
import { OtherFeedPage } from '../../lib/query';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { useSortedFeeds } from '../../hooks/feed/useSortedFeeds';
import MyFeedHeading from '../filters/MyFeedHeading';
import { SharedFeedPage } from '../utilities';
import PlusMobileEntryBanner from '../marketing/banners/PlusMobileEntryBanner';
import { TargetType } from '../../lib/log';
import usePlusEntry from '../../hooks/usePlusEntry';

enum FeedNavTab {
  ForYou = 'For you',
  Popular = 'Popular',
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
  'sticky flex h-14 pt-1 -translate-y-16 items-center justify-end bg-gradient-to-r from-transparent via-background-default via-40% to-background-default pr-4',
);

function FeedNav(): ReactElement | null {
  const router = useRouter();
  const { feedName: rawFeedName } = useActiveFeedNameContext();
  const feedName = rawFeedName as AllFeedPages;
  const { sortingEnabled } = useSettingsContext();
  const { isSortableFeed } = useFeedName({ feedName });
  const { home, bookmarks } = useActiveNav(feedName);
  const isMobile = useViewSize(ViewSize.MobileL);
  const isBelowLaptop = !useViewSize(ViewSize.Laptop);
  // Phones get the giveback entry via MobileFeedActions and laptop+ via the
  // header/rail; the tablet feed header is the only gap, so it renders its own.
  // JS-gated (not CSS) so it never mounts alongside the other placements.
  const isTablet = isBelowLaptop && !isMobile;
  // The copy-my-feed button widens the tablet corner overlay, so the last tab
  // needs a larger clearance margin — but only when the flag is on, keeping
  // flag-off pixel-identical.
  const isCopyMyFeedEnabled = useCopyMyFeedEnabled(isTablet);
  const { value: feedChipsVariant } = useConditionalFeature({
    feature: featureFeedChips,
    shouldEvaluate: isBelowLaptop,
  });
  const isFeedChipsEnabled = feedChipsVariant === FeedChipsVariant.V2;
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

  const urlToTab: Record<string, string> = useMemo(() => {
    const customFeeds = sortedFeeds.reduce<Record<string, string>>(
      (acc, { node: feed }) => {
        const isEditingFeed =
          router.query.slugOrId === feed.id &&
          router.pathname.endsWith('/edit');
        let feedPath = `${webappUrl}feeds/${feed.id}`;

        if (
          !isEditingFeed &&
          isCustomDefaultFeed &&
          feed.id === defaultFeedId
        ) {
          feedPath = `${webappUrl}`;
        }

        const urlPath = `${feedPath}${isEditingFeed ? '/edit' : ''}`;

        acc[urlPath] = feed.flags?.name || `Feed ${feed.id}`;

        return acc;
      },
      {},
    );

    const forYouTab = isCustomDefaultFeed ? `${webappUrl}my-feed` : webappUrl;

    return {
      [forYouTab]: FeedNavTab.ForYou,
      ...customFeeds,
      [`${webappUrl}bookmarks`]: FeedNavTab.Bookmarks,
      [`${webappUrl}feeds/new`]: FeedNavTab.NewFeed,
      [`${webappUrl}history`]: FeedNavTab.History,
      [`${webappUrl}following`]: FeedNavTab.Following,
      [`${webappUrl}posts`]: FeedNavTab.Popular,
      [`${webappUrl}${OtherFeedPage.Discussed}`]: FeedNavTab.Discussions,
      [`${webappUrl}tags`]: FeedNavTab.Tags,
      [`${webappUrl}sources`]: FeedNavTab.Sources,
      [`${webappUrl}users`]: FeedNavTab.Leaderboard,
    };
  }, [
    sortedFeeds,
    router.query.slugOrId,
    router.pathname,
    defaultFeedId,
    isCustomDefaultFeed,
  ]);

  const isDailyPage = router.pathname === '/daily';
  const shouldRenderNav = home || isDailyPage || (isMobile && bookmarks);
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
        {(isBelowLaptop && isFeedChipsEnabled) || isDailyPage ? (
          <UnifiedMobileFeedNav />
        ) : (
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
                item: classNames(
                  'px-1',
                  isCopyMyFeedEnabled
                    ? 'tablet:last-of-type:mr-36'
                    : 'tablet:last-of-type:mr-24',
                ),
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
        )}

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
        <div className="hidden items-center gap-2 bg-background-default tablet:absolute tablet:inset-y-0 tablet:right-0 tablet:flex laptop:hidden">
          {/* JS-gated like the giveback entry: phones already mount the button
              via MobileFeedActions, so don't mount a hidden duplicate here. */}
          {isTablet && <CopyMyFeedButton />}
          {isTablet && <GivebackGiftEntry compact />}
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
