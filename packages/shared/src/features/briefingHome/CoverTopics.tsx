import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { ArrowIcon, EyeIcon, TimerIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { TOPIC_TOKEN, type TopicDigest } from './types';
import { briefCopy } from './copy';

interface CoverTopicsProps {
  topics: TopicDigest[];
  readSet: Set<string>;
  onOpen: (topic: TopicDigest) => void;
  onMarkRead: (id: string) => void;
}

const estimateTopicMinutes = (topic: TopicDigest): number => {
  const words =
    topic.tldr.split(/\s+/).filter(Boolean).length +
    topic.content
      .replace(/<[^>]+>/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
};

const TopicCard = ({
  topic,
  isRead,
  isExpanded,
  onToggle,
  onOpen,
}: {
  topic: TopicDigest;
  isRead: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
}): ReactElement => {
  const minutes = estimateTopicMinutes(topic);
  const panelId = `brief-topic-tldr-${topic.id}`;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-controls={panelId}
      className={classNames(
        'group relative flex flex-col gap-2 text-left',
        isRead && !isExpanded && 'opacity-60',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Typography
          type={TypographyType.Caption2}
          bold
          className={classNames(
            'uppercase tracking-[0.14em]',
            TOPIC_TOKEN[topic.topic],
          )}
        >
          {topic.topic}
        </Typography>
        <span className="inline-flex items-center gap-1.5">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="tabular-nums"
          >
            {briefCopy.storyReadTime(minutes)}
          </Typography>
          <TimerIcon size={IconSize.XSmall} className="text-text-tertiary" />
        </span>
      </div>
      <Typography
        type={TypographyType.Body}
        bold
        color={isRead ? TypographyColor.Tertiary : TypographyColor.Primary}
        className={classNames(
          '!leading-snug',
          isRead && !isExpanded && 'decoration-text-quaternary/40 line-through',
        )}
      >
        {topic.title}
      </Typography>
      <div id={panelId}>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className={classNames(
            '!leading-relaxed',
            !isExpanded && 'line-clamp-2',
          )}
        >
          {topic.tldr}
        </Typography>
      </div>
      {isExpanded ? (
        <div className="mt-1 flex w-full items-center justify-end">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                onOpen();
              }
            }}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-10 bg-text-primary px-3 py-1.5 text-surface-invert transition-colors hover:bg-brand-default focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-subtlest-primary"
          >
            <Typography type={TypographyType.Footnote} bold>
              Read full breakdown
            </Typography>
            <ArrowIcon size={IconSize.XXSmall} className="rotate-90" />
          </span>
        </div>
      ) : null}
    </button>
  );
};

export const CoverTopics = ({
  topics,
  readSet,
  onOpen,
  onMarkRead,
}: CoverTopicsProps): ReactElement => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section>
      <div className="mb-8 flex items-baseline gap-2">
        <EyeIcon
          size={IconSize.Small}
          className="self-center text-accent-water-default"
          secondary
        />
        <Typography type={TypographyType.Title3} bold>
          On your radar
        </Typography>
      </div>
      <div className="grid grid-cols-1 gap-x-16 gap-y-12 tablet:grid-cols-2">
        {topics.map((t) => (
          <TopicCard
            key={t.id}
            topic={t}
            isRead={readSet.has(t.id)}
            isExpanded={expanded === t.id}
            onToggle={() => {
              const isOpen = expanded === t.id;
              setExpanded(isOpen ? null : t.id);
              if (!isOpen) {
                onMarkRead(t.id);
              }
            }}
            onOpen={() => onOpen(t)}
          />
        ))}
      </div>
    </section>
  );
};
