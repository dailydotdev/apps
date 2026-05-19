import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { ArrowIcon } from '../../components/icons';
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
import { useCoverState } from './hooks/useCoverState';
import type { BriefEntity, StoryItem, TopicDigest } from './types';
import { briefCopy } from './copy';

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
  const { readSet, markRead } = useReadTracker();
  const {
    isHydrated,
    isCollapsed,
    isHidden,
    collapse,
    expand,
    hideForToday,
    reshow,
  } = useCoverState();
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

  if (!isAuthReady || !isHydrated || !enabled || isHidden) {
    if (enabled && isHidden && isHydrated) {
      return (
        <div className={classNames('flex justify-center px-4 py-2', className)}>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon />}
            onClick={reshow}
          >
            {briefCopy.controlReshow}
          </Button>
        </div>
      );
    }
    return null;
  }

  if (isCollapsed) {
    return (
      <div
        className={classNames(
          'mx-auto mb-4 flex w-full max-w-[68rem] items-center justify-between gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle px-4 py-2.5',
          className,
        )}
      >
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className="truncate"
        >
          {briefCopy.collapsed(
            totals.total,
            totals.readMinutes,
            totals.savedMinutes,
          )}
        </Typography>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={expand}
        >
          {briefCopy.controlExpand}
        </Button>
      </div>
    );
  }

  return (
    <section
      aria-label="Your daily brief"
      className={classNames(
        'mx-auto mb-6 w-full max-w-[68rem] px-3 tablet:px-4',
        className,
      )}
    >
      <CoverHeader
        onCollapse={collapse}
        onHide={hideForToday}
        skipAnchor="#brief-end"
      />
      <CoverLead
        story={brief.lead}
        totals={totals}
        onOpen={() => openPanel(brief.lead)}
      />
      <CoverGrid
        stories={brief.reads}
        readSet={readSet}
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
      <CoverClosing
        totals={totals}
        onCollapse={collapse}
        skipAnchor="#brief-end"
      />
      <div id="brief-end" />
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
