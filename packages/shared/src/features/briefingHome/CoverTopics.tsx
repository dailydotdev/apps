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
import { StatPill } from './StatPill';
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
        'group relative flex flex-col gap-2 text-left',
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
        <StatPill
          ariaLabel={`${minutes} minutes read`}
          icon={
            <TimerIcon size={IconSize.XSmall} className="text-text-tertiary" />
          }
          value={briefCopy.storyReadTime(minutes)}
        />
      </div>
      <Typography
        type={TypographyType.Body}
        bold
        color={isRead ? TypographyColor.Tertiary : TypographyColor.Primary}
        className={classNames(
          '!leading-snug transition-colors',
          isRead && 'decoration-text-quaternary/40 line-through',
          !isRead && 'group-hover:text-brand-default',
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
    <div className="mb-4 flex items-baseline gap-2">
      <EyeIcon
        size={IconSize.Small}
        className="self-center text-accent-water-default"
        secondary
      />
      <Typography type={TypographyType.Title3} bold>
        On your radar
      </Typography>
    </div>
    <div className="grid grid-cols-1 gap-x-12 gap-y-10 tablet:grid-cols-2">
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
