import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { CoverHeader } from './CoverHeader';
import { CoverGrid } from './CoverGrid';
import { CoverTopics } from './CoverTopics';
import { CoverClosing } from './CoverClosing';
import { useViewSize, ViewSize } from '../../hooks';
import { useFeeds } from '../../hooks/feed/useFeeds';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { ExploreChipsBar } from '../../components/feeds/ExploreChipsBar';
import UnifiedMobileFeedNav from '../../components/feeds/UnifiedMobileFeedNav';
import { buildPersonalizedCategories } from '../../components/feeds/exploreCategories';

interface DailyHomeProps {
  className?: string;
}

export const DailyHome = ({
  className,
}: DailyHomeProps): ReactElement | null => {
  const isLaptop = useViewSize(ViewSize.Laptop);
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
      {isLaptop ? (
        <div className="w-full px-10 pt-10">
          <ExploreChipsBar categories={exploreCategories} isPending={!feeds} />
        </div>
      ) : (
        <UnifiedMobileFeedNav />
      )}
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
          <CoverClosing />
        </div>
      </section>
    </>
  );
};
