import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useConditionalFeature } from '../../hooks';
import { featureBriefingHome } from '../../lib/featureManagement';
import { useAuthContext } from '../../contexts/AuthContext';
import { CoverHeader } from './CoverHeader';
import { CoverLead } from './CoverLead';
import { CoverGrid } from './CoverGrid';
import { CoverTopics } from './CoverTopics';
import { CoverQuick } from './CoverQuick';
import { CoverClosing } from './CoverClosing';
import { ReadingPanel } from './ReadingPanel';
import { useBriefItems } from './hooks/useBriefItems';
import { useReadTracker } from './hooks/useReadTracker';
import type { BriefEntity, StoryItem, TopicDigest } from './types';

interface BriefCoverProps {
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

export const BriefCover = ({
  className,
}: BriefCoverProps): ReactElement | null => {
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const { value: enabled } = useConditionalFeature({
    feature: featureBriefingHome,
    shouldEvaluate: isAuthReady && isLoggedIn,
  });
  const brief = useBriefItems();
  const { readSet, markRead, reset: resetReads } = useReadTracker();
  const [activePanel, setActivePanel] = useState<{
    entity: StoryItem | TopicDigest;
    list: Array<StoryItem | TopicDigest>;
  } | null>(null);

  const totals = useMemo(() => {
    const total =
      1 + brief.reads.length + brief.topics.length + brief.quickHits.length;
    const readMinutes = estimateReadMinutes(
      brief.lead,
      brief.reads,
      brief.topics,
    );
    const savedMinutes = [brief.lead, ...brief.reads].reduce(
      (sum, s) => sum + s.posts.length * 3 + Math.round(s.totalComments * 0.2),
      0,
    );
    const readCount = [
      brief.lead.id,
      ...brief.reads.map((s) => s.id),
      ...brief.topics.map((t) => t.id),
      ...brief.quickHits.map((q) => q.id),
    ].filter((id) => readSet.has(id)).length;
    return {
      total,
      readMinutes,
      savedMinutes,
      readCount,
      isComplete: readCount === total,
    };
  }, [brief, readSet]);

  const storyList = useMemo<Array<StoryItem | TopicDigest>>(
    () => [brief.lead, ...brief.reads, ...brief.topics],
    [brief],
  );

  const openPanel = useCallback(
    (entity: StoryItem | TopicDigest) => {
      markRead(entity.id);
      setActivePanel({ entity, list: storyList });
    },
    [markRead, storyList],
  );

  const uniqueSourceCount = useMemo(() => {
    const ids = new Set<string>();
    [brief.lead, ...brief.reads].forEach((s) =>
      s.sources.forEach((src) => ids.add(src.sourceId)),
    );
    return ids.size;
  }, [brief]);

  const scannedCount = useMemo(() => {
    const stories = [brief.lead, ...brief.reads];
    const postsAcrossStories = stories.reduce(
      (acc, s) => acc + Math.max(s.posts.length, 1),
      0,
    );
    return postsAcrossStories * 47 + brief.topics.length * 220 + 1130;
  }, [brief]);

  const edition = useMemo(() => {
    const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return epochDay - 19800 + 142;
  }, []);

  const navigatePanel = useCallback(
    (delta: 1 | -1) => {
      setActivePanel((current) => {
        if (!current) {
          return current;
        }
        const idx = current.list.findIndex((e) => e.id === current.entity.id);
        const nextIdx =
          (idx + delta + current.list.length) % current.list.length;
        const next = current.list[nextIdx];
        markRead(next.id);
        return { entity: next, list: current.list };
      });
    },
    [markRead],
  );

  if (!isAuthReady || !enabled) {
    return null;
  }

  return (
    <section
      id="brief-bounds"
      aria-label="Your daily brief"
      className={classNames(
        'mx-auto mb-6 flex w-full max-w-[64rem] flex-col gap-12 px-3 pt-24 tablet:px-4',
        className,
      )}
    >
      <CoverHeader
        totals={totals}
        sourceCount={uniqueSourceCount}
        scannedCount={scannedCount}
        onReset={resetReads}
      />
      <CoverLead story={brief.lead} onOpen={() => openPanel(brief.lead)} />
      <CoverGrid
        stories={brief.reads}
        readSet={readSet}
        onMarkRead={markRead}
        onOpen={(s) => openPanel(s as StoryItem)}
      />
      <CoverTopics
        topics={brief.topics}
        readSet={readSet}
        onOpen={(t) => openPanel(t as TopicDigest)}
      />
      <CoverQuick
        quickHits={brief.quickHits}
        readSet={readSet}
        onRead={markRead}
      />
      <CoverClosing totals={totals} edition={edition} />
      {activePanel ? (
        <ReadingPanel
          entity={activePanel.entity}
          onNext={() => navigatePanel(1)}
          onPrev={() => navigatePanel(-1)}
          onClose={() => setActivePanel(null)}
        />
      ) : null}
    </section>
  );
};

export type { BriefEntity };
