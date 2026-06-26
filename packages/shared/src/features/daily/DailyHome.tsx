import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { CoverHeader } from './CoverHeader';
import { CoverGrid } from './CoverGrid';
import { CoverTopics } from './CoverTopics';
import { CoverClosing } from './CoverClosing';
import { useViewSize, ViewSize } from '../../hooks';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';
import { useFeeds } from '../../hooks/feed/useFeeds';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { ExploreChipsBar } from '../../components/feeds/ExploreChipsBar';
import UnifiedMobileFeedNav from '../../components/feeds/UnifiedMobileFeedNav';
import { MobileFeedActions } from '../../components/feeds/MobileFeedActions';
import { buildPersonalizedCategories } from '../../components/feeds/exploreCategories';
import { pageHeaderClassName } from '../../components/layout/PageHeader';

interface DailyHomeProps {
  className?: string;
  onBackToFeed?: () => void;
  onNavTabClick?: (tab: string) => void;
}

export const DailyHome = ({
  className,
  onBackToFeed,
  onNavTabClick,
}: DailyHomeProps): ReactElement | null => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isV2 } = useLayoutVariant();
  const { feeds } = useFeeds();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();

  const exploreCategories = useMemo(
    () =>
      buildPersonalizedCategories(feeds?.edges ?? [], {
        defaultFeedId,
        isCustomDefaultFeed,
      }),
    [feeds?.edges, defaultFeedId, isCustomDefaultFeed],
  );

  return (
    <>
      {!isLaptop && (
        <>
          <MobileFeedActions />
          <UnifiedMobileFeedNav dailyActive />
        </>
      )}
      {isLaptop &&
        (isV2 ? (
          <header className={classNames(pageHeaderClassName, '!py-0')}>
            <ExploreChipsBar
              categories={exploreCategories}
              isPending={!feeds}
              compact
              dailyActive
              onNavTabClick={onNavTabClick}
            />
          </header>
        ) : (
          <div className="w-full px-10 pt-10">
            <ExploreChipsBar
              categories={exploreCategories}
              isPending={!feeds}
              dailyActive
              onNavTabClick={onNavTabClick}
            />
          </div>
        ))}
      <section
        id="daily-bounds"
        aria-label="Your Daily"
        className={classNames(
          'mx-auto mb-6 flex w-full max-w-[60rem] flex-col px-4 pt-6',
          className,
        )}
      >
        <div className="flex flex-col gap-4">
          <CoverHeader />
          <CoverTopics />
          <CoverGrid />
          <CoverClosing onBackToFeed={onBackToFeed} />
        </div>
      </section>
    </>
  );
};
