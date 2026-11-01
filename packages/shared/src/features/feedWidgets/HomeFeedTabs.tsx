import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
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
  ForYouSheet,
  ForYouSortMenu,
  ForYouTabLabel,
  getForYouMenuAriaLabel,
  useForYouSort,
} from '../../components/feeds/ForYouSort';
import MyFeedHeading from '../../components/filters/MyFeedHeading';
import { ToggleClickbaitShield } from '../../components/buttons/ToggleClickbaitShield';
import { AchievementTrackerButton } from '../../components/filters/AchievementTrackerButton';
import { LuckyButton } from '../../components/filters/LuckyButton';
import { ReadingStreakButton } from '../../components/streak/ReadingStreakButton';
import PlusMobileEntryBanner from '../../components/marketing/banners/PlusMobileEntryBanner';
import { HomeSegments } from '../../components/shell/HomeSegments';
import { ShellDockedRow } from '../../components/shell/ShellPageContext';
import { usePassedBlock } from '../../components/shell/usePassedBlock';
import { useShellEdge } from '../../components/shell/useShellScroll';
import { pageHeaderClassName } from '../../components/layout/PageHeader';
import { DEFAULT_ALGORITHM_INDEX } from '../../components/layout/common';
import { SharedFeedPage } from '../../components/utilities/common';
import { useIsPhoneNow } from '../../hooks/useViewSize';
import { useLaptopLayout } from '../../hooks/layout/useLaptopLayout';
import { useReadingStreak } from '../../hooks/streaks/useReadingStreak';
import usePlusEntry from '../../hooks/usePlusEntry';
import { Origin, TargetType } from '../../lib/log';
import type { AllFeedPages } from '../../lib/query';
import { useInert } from './FeedWidgetFrame';
import { FeedExplainSwitch } from '../feedExplain/components/FeedExplainSwitch';
import { useFeedExplainMode } from '../feedExplain/useFeedExplainMode';

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
 * tablet, the shell's segments on phones. The lit For you tab holds the
 * feed's sort, so the separate sort button goes; phones keep Feed settings
 * in its sheet too. The actions are all Tertiary Small, Feed settings last.
 */
export function HomeFeedTabs({
  feedName,
  heading,
  hasChips,
  categories,
  isChipsPending,
}: HomeFeedTabsProps): ReactElement {
  // Never in the server render (the rail waits for the flags), so the
  // screen is read at once rather than painting the tablet strip first.
  const isPhone = useIsPhoneNow();
  const isLaptopLayout = useLaptopLayout();
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();
  const { plusEntryForYou } = usePlusEntry();
  const blockBottom = useShellEdge();
  const anchorRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const phoneRowRef = useRef<HTMLDivElement>(null);
  const hasPhoneRowPassed = usePassedBlock(phoneRowRef, isPhone);
  // Docked, the in-page row only collapses visually, and the block holds a
  // second copy; so the collapsed one leaves the tab order and the tree.
  useInert(phoneRowRef, hasPhoneRowPassed);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // A new sort starts the feed over, so a reader who sorted from the pinned
  // row lands on its first cards instead of deep in a shorter page.
  const onSortChange = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) {
      return;
    }
    const pinnedAt = isPhone
      ? blockBottom
      : parseFloat(getComputedStyle(rowRef.current ?? anchor).top) || 0;
    const top = anchor.getBoundingClientRect().top - pinnedAt;
    if (top < 0) {
      window.scrollTo({ top: window.scrollY + top });
    }
  }, [blockBottom, isPhone]);
  const sort = useForYouSort(onSortChange);
  const { isExplaining } = useFeedExplainMode({
    isRecommended: sort.selected === DEFAULT_ALGORITHM_INDEX,
  });
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

  if (isPhone) {
    const phoneRow = (
      <div className="flex items-stretch">
        <div className="min-w-0 flex-1">
          <HomeSegments
            forYou={{
              label: (
                <ForYouTabLabel
                  label={forYouLabel}
                  selected={sort.selected}
                  isExplaining={isExplaining}
                />
              ),
              ariaLabel: getForYouMenuAriaLabel({
                label: forYouLabel,
                selected: sort.selected,
                isExplaining,
              }),
              onMenu: () => setIsSheetOpen(true),
            }}
          />
        </div>
        {hasPopularSort && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<SortIcon />}
            aria-label="Sort and feed settings"
            className="my-auto mr-2"
            onClick={() => setIsSheetOpen(true)}
          />
        )}
        {/* A custom default feed is the page on `/`: its own chip is lit,
            so Feed settings keeps the bar, as it does without the rail. */}
        {feedName === SharedFeedPage.Custom && (
          <MyFeedHeading
            iconOnly
            quiet
            feedSettingsButtonProps={{
              size: ButtonSize.Small,
              variant: ButtonVariant.Tertiary,
              className: 'my-auto mr-2',
            }}
          />
        )}
      </div>
    );

    return (
      <>
        <div ref={anchorRef} />
        {/* Docked, the row's height moves into the block, so the feed stays put. */}
        <div
          ref={phoneRowRef}
          className={classNames(
            'border-b border-border-subtlest-tertiary bg-background-default',
            hasPhoneRowPassed && 'h-0 overflow-hidden',
          )}
        >
          {phoneRow}
        </div>
        {hasPhoneRowPassed && <ShellDockedRow>{phoneRow}</ShellDockedRow>}
        {banner}
        <ForYouSheet
          title={isPopular ? heading : forYouLabel}
          sort={{ ...sort, canSort }}
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
        />
      </>
    );
  }

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
