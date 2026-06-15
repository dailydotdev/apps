import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { CoverHeader } from './CoverHeader';
import { CoverGrid } from './CoverGrid';
import { CoverTopics } from './CoverTopics';
import { CoverClosing } from './CoverClosing';
import { useDailyItems } from './hooks/useDailyItems';
import { useReadTracker } from './hooks/useReadTracker';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import { useViewSize, ViewSize } from '../../hooks';
import { useFeeds } from '../../hooks/feed/useFeeds';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { ExploreChipsBar } from '../../components/feeds/ExploreChipsBar';
import UnifiedMobileFeedNav from '../../components/feeds/UnifiedMobileFeedNav';
import { buildPersonalizedCategories } from '../../components/feeds/exploreCategories';
import type { StoryItem, TopicDigest } from './types';

interface DailyHomeProps {
  className?: string;
}

const wordsIn = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

const estimateReadMinutes = (
  lead: StoryItem,
  reads: StoryItem[],
  topics: TopicDigest[],
): number => {
  const stories = [lead, ...reads];
  const storyWords = stories.reduce(
    (sum, s) =>
      sum +
      wordsIn(s.summary) +
      s.highlightedComments
        .slice(0, 2)
        .reduce((acc, c) => acc + wordsIn(c.content), 0),
    0,
  );
  const topicWords = topics.reduce(
    (sum, t) =>
      sum + wordsIn(t.tldr) + wordsIn(t.content.replace(/<[^>]+>/g, ' ')) * 0.3,
    0,
  );
  return Math.max(3, Math.round((storyWords + topicWords) / 220));
};

export const DailyHome = ({
  className,
}: DailyHomeProps): ReactElement | null => {
  const daily = useDailyItems();
  const { markRead } = useReadTracker();
  const { logEvent } = useLogContext();
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

  const onMarkRead = useCallback(
    (id: string) => {
      markRead(id);
      logEvent({
        event_name: LogEvent.ReadDailyItem,
        target_id: id,
        extra: JSON.stringify({ origin: Origin.DailyPage }),
      });
    },
    [markRead, logEvent],
  );

  const discussions = useMemo<StoryItem[]>(
    () => [daily.lead, ...daily.reads].slice(0, 5),
    [daily],
  );

  const totals = useMemo(() => {
    const total = discussions.length + daily.topics.length;
    const readMinutes = estimateReadMinutes(
      daily.lead,
      daily.reads,
      daily.topics,
    );
    return {
      total,
      readMinutes,
    };
  }, [daily, discussions]);

  const uniqueSourceCount = useMemo(() => {
    const ids = new Set<string>();
    [daily.lead, ...daily.reads].forEach((s) =>
      s.sources.forEach((src) => ids.add(src.sourceId)),
    );
    return ids.size;
  }, [daily]);

  const scannedCount = useMemo(() => {
    const stories = [daily.lead, ...daily.reads];
    const postsAcrossStories = stories.reduce(
      (acc, s) => acc + Math.max(s.posts.length, 1),
      0,
    );
    return postsAcrossStories * 47 + daily.topics.length * 220 + 1130;
  }, [daily]);

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
        aria-label="Your daily brief"
        className={classNames(
          'mx-auto mb-6 flex w-full max-w-[60rem] flex-col px-4 pt-6',
          className,
        )}
      >
        <div className="flex flex-col gap-4">
          <CoverHeader
            totals={totals}
            sourceCount={uniqueSourceCount}
            scannedCount={scannedCount}
          />
          <CoverTopics topics={daily.topics} onMarkRead={onMarkRead} />
          <CoverGrid onMarkRead={onMarkRead} />
          <CoverClosing />
        </div>
      </section>
    </>
  );
};
