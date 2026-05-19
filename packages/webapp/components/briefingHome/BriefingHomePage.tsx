import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { Hero } from './Hero';
import { LeadStory } from './LeadStory';
import { StoryRow } from './StoryRow';
import { TopicDigestGrid } from './TopicDigestGrid';
import { QuickHits } from './QuickHits';
import { ClosingCard } from './ClosingCard';
import { ExploreBridge } from './ExploreBridge';
import { BriefFooter } from './BriefFooter';
import { SectionEyebrow } from './SectionEyebrow';
import { useBriefItems } from './hooks/useBriefItems';
import { useReadTracker } from './hooks/useReadTracker';
import { briefCopy } from './copy';
import type { StoryItem, TopicDigest, QuickHit } from './types';

const wordsIn = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

const estimateReadMinutes = (
  lead: StoryItem,
  reads: StoryItem[],
  topics: TopicDigest[],
  quickHits: QuickHit[],
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
  const quickWords = quickHits.reduce((sum, q) => sum + wordsIn(q.title), 0);
  return Math.max(3, Math.round((storyWords + topicWords + quickWords) / 220));
};

export const BriefingHomePage = (): ReactElement => {
  const brief = useBriefItems();
  const { readSet, markRead } = useReadTracker();

  const allStoryIds = useMemo(
    () => [brief.lead.id, ...brief.reads.map((s) => s.id)],
    [brief],
  );
  const totalStories =
    1 + brief.reads.length + brief.topics.length + brief.quickHits.length;
  const readMinutes = useMemo(
    () =>
      estimateReadMinutes(
        brief.lead,
        brief.reads,
        brief.topics,
        brief.quickHits,
      ),
    [brief],
  );
  const savedMinutes = useMemo(() => {
    const stories = [brief.lead, ...brief.reads];
    return stories.reduce(
      (sum, s) => sum + s.posts.length * 3 + Math.round(s.totalComments * 0.2),
      0,
    );
  }, [brief]);

  const allReadCount = useMemo(
    () =>
      [
        ...allStoryIds,
        ...brief.topics.map((t) => t.id),
        ...brief.quickHits.map((q) => q.id),
      ].filter((id) => readSet.has(id)).length,
    [allStoryIds, brief, readSet],
  );
  const isComplete = allReadCount === totalStories;

  return (
    <div
      className={classNames(
        'mx-auto w-full max-w-[64rem]',
        'px-4 pb-16 tablet:px-6 laptop:px-8',
      )}
    >
      <Hero storyCount={totalStories} readMinutes={readMinutes} />

      <SectionEyebrow label={briefCopy.leadEyebrow} />
      <LeadStory
        story={brief.lead}
        isRead={readSet.has(brief.lead.id)}
        onRead={() => markRead(brief.lead.id)}
      />

      <SectionEyebrow label={briefCopy.readsEyebrow} className="mt-12" />
      <ul className="flex flex-col">
        {brief.reads.map((story) => (
          <li key={story.id}>
            <StoryRow
              story={story}
              isRead={readSet.has(story.id)}
              onRead={() => markRead(story.id)}
            />
          </li>
        ))}
      </ul>

      <SectionEyebrow label={briefCopy.topicsEyebrow} className="mt-12" />
      <TopicDigestGrid
        topics={brief.topics}
        readSet={readSet}
        onRead={markRead}
      />

      <SectionEyebrow label={briefCopy.quickEyebrow} className="mt-12" />
      <QuickHits
        quickHits={brief.quickHits}
        readSet={readSet}
        onRead={markRead}
      />

      <ClosingCard
        totalStories={totalStories}
        readMinutes={readMinutes}
        savedMinutes={savedMinutes}
        progress={allReadCount}
        isComplete={isComplete}
      />

      <ExploreBridge />
      <BriefFooter />
    </div>
  );
};
