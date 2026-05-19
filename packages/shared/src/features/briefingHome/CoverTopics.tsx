import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { EyeIcon, TimerIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { TOPIC_TOKEN, type TopicDigest } from './types';
import { briefCopy } from './copy';

interface CoverTopicsProps {
  topics: TopicDigest[];
  readSet: Set<string>;
  onOpen: (topic: TopicDigest) => void;
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
  onOpen,
}: {
  topic: TopicDigest;
  isRead: boolean;
  onOpen: () => void;
}): ReactElement => {
  const minutes = estimateTopicMinutes(topic);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={classNames(
        'group flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4 text-left transition-colors hover:border-border-subtlest-secondary hover:bg-surface-float',
        isRead && 'opacity-60',
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
        <span className="inline-flex items-center gap-1 text-text-quaternary">
          <TimerIcon size={IconSize.XXSmall} />
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            {briefCopy.storyReadTime(minutes)}
          </Typography>
        </span>
      </div>
      <Typography
        type={TypographyType.Body}
        bold
        color={isRead ? TypographyColor.Tertiary : TypographyColor.Primary}
        className={classNames(
          '!leading-snug transition-colors group-hover:text-brand-default',
          isRead && 'decoration-text-quaternary/40 line-through',
        )}
      >
        {topic.title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="line-clamp-2 !leading-snug"
      >
        {topic.tldr}
      </Typography>
    </button>
  );
};

export const CoverTopics = ({
  topics,
  readSet,
  onOpen,
}: CoverTopicsProps): ReactElement => (
  <section>
    <div className="mb-2 flex items-center gap-2 px-1">
      <EyeIcon
        size={IconSize.XSmall}
        className="text-accent-water-default"
        secondary
      />
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Primary}
        bold
        className="uppercase tracking-[0.16em]"
      >
        {briefCopy.topicsEyebrow}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        className="tabular-nums"
      >
        · {topics.length}
      </Typography>
    </div>
    <div className="grid grid-cols-1 gap-2.5 tablet:grid-cols-2">
      {topics.map((t) => (
        <TopicCard
          key={t.id}
          topic={t}
          isRead={readSet.has(t.id)}
          onOpen={() => onOpen(t)}
        />
      ))}
    </div>
  </section>
);
