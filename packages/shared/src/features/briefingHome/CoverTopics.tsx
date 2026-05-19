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
import { TOPIC_BG_TOKEN, TOPIC_TOKEN, type TopicDigest } from './types';
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
        'group relative flex flex-col gap-2 overflow-hidden rounded-12 p-4 text-left transition-colors',
        TOPIC_BG_TOKEN[topic.topic],
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
          'group-hover:opacity-80 !leading-snug transition-colors',
          isRead && 'decoration-text-quaternary/40 line-through',
        )}
      >
        {topic.title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
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
    <div className="mb-3 flex items-baseline gap-2 px-1">
      <EyeIcon
        size={IconSize.Small}
        className="self-center text-accent-water-default"
        secondary
      />
      <Typography type={TypographyType.Title3} bold>
        On your radar
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
