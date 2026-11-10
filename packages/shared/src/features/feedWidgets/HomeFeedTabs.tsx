import type { ReactElement } from 'react';
import React, { useCallback, useRef } from 'react';
import classNames from 'classnames';
import { Button } from '../../components/buttons/Button';
import {
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/common';
import { ArrowIcon } from '../../components/icons/Arrow';
import { SortIcon } from '../../components/icons/Sort';
import { IconSize } from '../../components/Icon';
import { ExploreChipsBar } from '../../components/feeds/ExploreChipsBar';
import type { ExploreCategory } from '../../components/feeds/exploreCategories';
import UnifiedMobileFeedNav from '../../components/feeds/UnifiedMobileFeedNav';
import {
  forYouChevronClassName,
  ForYouSortMenu,
  ForYouTabLabel,
  useForYouSort,
} from '../../components/feeds/ForYouSort';
import MyFeedHeading from '../../components/filters/MyFeedHeading';
import { ToggleClickbaitShield } from '../../components/buttons/ToggleClickbaitShield';
import { AchievementTrackerButton } from '../../components/filters/AchievementTrackerButton';
import { LuckyButton } from '../../components/filters/LuckyButton';
import { ReadingStreakButton } from '../../components/streak/ReadingStreakButton';
import PlusMobileEntryBanner from '../../components/marketing/banners/PlusMobileEntryBanner';
import { pageHeaderClassName } from '../../components/layout/PageHeader';
import { DEFAULT_ALGORITHM_INDEX } from '../../components/layout/common';
import { SharedFeedPage } from '../../components/utilities/common';
import { useLaptopLayout } from '../../hooks/layout/useLaptopLayout';
import { useReadingStreak } from '../../hooks/streaks/useReadingStreak';
import usePlusEntry from '../../hooks/usePlusEntry';
import { Origin, TargetType } from '../../lib/log';
import type { AllFeedPages } from '../../lib/query';
import { FeedExplainSwitch } from '../feedExplain/components/FeedExplainSwitch';

export interface HomeFeedTabsProps {
  /** The feed on screen: a custom feed when it is the reader's default. */
  feedName: AllFeedPages;
  /** The feed's name, the one tab when there are no chips. */
  heading: string;
  /** Laptop: the reader's custom feeds as chips, as the page header had. */
  hasChips: boolean;
  categories: ExploreCategory[];
  isChipsPending: boolean;
}

const forYouLabel = 'For you';

/**
 * The feed's tabs under the widget rail, pinned once the rail scrolls away,
 * with each screen's own feeds: the chips on laptop, the chip strip on
 * tablet. The lit For you tab holds the feed's sort, so the separate sort
 * button goes. The actions are all Tertiary Small, Feed settings last.
 */
export function HomeFeedTabs({
  feedName,
  heading,
  hasChips,
  categories,
  isChipsPending,
}: HomeFeedTabsProps): ReactElement {
  const isLaptopLayout = useLaptopLayout();
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();
  const { plusEntryForYou } = usePlusEntry();
  const anchorRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  // A new sort starts the feed over, so a reader who sorted from the pinned
  // row lands on its first cards instead of deep in a shorter page.
  const onSortChange = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) {
      return;
    }
    const pinnedAt =
      parseFloat(getComputedStyle(rowRef.current ?? anchor).top) || 0;
    const top = anchor.getBoundingClientRect().top - pinnedAt;
    if (top < 0) {
      window.scrollTo({ top: window.scrollY + top });
    }
  }, []);
  const sort = useForYouSort(onSortChange);
  const isForYou = feedName === SharedFeedPage.MyFeed;
  const hasFeedActions = isForYou || feedName === SharedFeedPage.Custom;
  const canSort = sort.canSort && feedName !== SharedFeedPage.Custom;
  const isPopular = feedName === SharedFeedPage.Popular;
  const canSortOnForYou = canSort && !isPopular;
  const hasPopularSort = canSort && isPopular;
  const banner = !isLaptopLayout && isForYou && plusEntryForYou && (
    <PlusMobileEntryBanner
      targetType={TargetType.PlusEntryForYouTab}
      arrow
      {...plusEntryForYou}
    />
  );

  const quietButton = {
    size: ButtonSize.Small,
    variant: ButtonVariant.Tertiary,
  };
  const shield = hasFeedActions && (
    <ToggleClickbaitShield
      origin={
        feedName === SharedFeedPage.Custom ? Origin.CustomFeed : Origin.Feed
      }
      buttonProps={quietButton}
      iconButtonProps={quietButton}
    />
  );
  const explainSwitch = isForYou && (
    <FeedExplainSwitch
      isRecommended={sort.selected === DEFAULT_ALGORITHM_INDEX}
      buttonProps={quietButton}
      iconOnly={!isLaptopLayout}
    />
  );
  const feedSettings = hasFeedActions && (
    <MyFeedHeading quiet feedSettingsButtonProps={quietButton} />
  );
  if (!isLaptopLayout) {
    return (
      <>
        <div ref={anchorRef} />
        <div
          ref={rowRef}
          className="sticky top-0 z-3 flex items-center gap-2 border-b border-border-subtlest-tertiary bg-background-default px-3 laptop:-mx-6 laptop:px-6"
        >
          <UnifiedMobileFeedNav
            className="py-3"
            renderForYou={
              canSortOnForYou
                ? (className) => (
                    <ForYouSortMenu sort={sort}>
                      <button
                        type="button"
                        aria-current="page"
                        data-active="true"
                        className={classNames(
                          className,
                          'inline-flex items-center',
                        )}
                      >
                        <ForYouTabLabel
                          label={forYouLabel}
                          selected={sort.selected}
                          hasChevron
                        />
                      </button>
                    </ForYouSortMenu>
                  )
                : undefined
            }
          />
          <div className="flex shrink-0 items-center gap-1">
            {hasPopularSort && (
              <ForYouSortMenu sort={sort}>
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  icon={<SortIcon />}
                  aria-label="Sort"
                />
              </ForYouSortMenu>
            )}
            {hasFeedActions && <AchievementTrackerButton quiet />}
            {shield}
            {hasFeedActions && <LuckyButton quiet />}
            {isStreaksEnabled && streak && (
              <ReadingStreakButton
                streak={streak}
                isLoading={isLoading}
                compact
              />
            )}
            {explainSwitch}
            {hasFeedActions && (
              <MyFeedHeading
                quiet
                iconOnly
                feedSettingsButtonProps={quietButton}
              />
            )}
          </div>
        </div>
        {banner}
      </>
    );
  }

  const laptopTab = (label: string) => (
    <ForYouSortMenu sort={sort}>
      <Button
        type="button"
        aria-current="page"
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
        pressed
        icon={
          <ArrowIcon
            size={IconSize.Size16}
            className={forYouChevronClassName}
          />
        }
        iconPosition={ButtonIconPosition.Right}
      >
        <ForYouTabLabel label={label} selected={sort.selected} />
      </Button>
    </ForYouSortMenu>
  );

  return (
    <>
      <div ref={anchorRef} />
      <div
        ref={rowRef}
        className={classNames(
          pageHeaderClassName,
          'sticky top-[var(--sticky-header-offset)] z-3 bg-background-default !py-0',
        )}
      >
        <div className="min-w-0 flex-1">
          {hasChips ? (
            <ExploreChipsBar
              categories={categories}
              isPending={isChipsPending}
              renderForYou={canSort ? () => laptopTab(forYouLabel) : undefined}
              quiet
            />
          ) : (
            <span className="relative flex w-fit items-center py-3 after:absolute after:inset-x-0 after:bottom-0 after:mx-auto after:w-1/2 after:border-b-2 after:border-text-primary">
              {canSort ? (
                laptopTab(heading)
              ) : (
                <strong className="px-3 typo-callout">{heading}</strong>
              )}
            </span>
          )}
        </div>
        {hasFeedActions && (
          <div className="flex shrink-0 items-center gap-1">
            <AchievementTrackerButton quiet />
            {shield}
            {explainSwitch}
            {feedSettings}
          </div>
        )}
      </div>
    </>
  );
}
