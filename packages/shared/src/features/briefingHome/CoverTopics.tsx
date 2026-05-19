import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ArrowIcon, EyeIcon, TimerIcon } from '../../components/icons';
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
    <article
      className={classNames(
        'group relative flex flex-col gap-3 overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-5 transition-colors hover:bg-surface-float',
        isRead && 'opacity-60',
      )}
    >
      <span
        aria-hidden
        className={classNames(
          'absolute inset-x-0 top-0 h-0.5',
          TOPIC_BG_TOKEN[topic.topic],
        )}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={classNames(
              'inline-block size-2 rounded-full',
              TOPIC_BG_TOKEN[topic.topic],
            )}
          />
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
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            · {briefCopy.topicWeekly}
          </Typography>
        </div>
        <span className="inline-flex items-center gap-1 text-text-quaternary">
          <TimerIcon size={IconSize.XXSmall} />
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
            bold
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
          '!leading-snug tracking-[-0.01em]',
          isRead && 'decoration-text-quaternary/40 line-through',
        )}
      >
        {topic.title}
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="line-clamp-3 !leading-snug"
      >
        {topic.tldr}
      </Typography>
      <div className="mt-auto pt-1">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="rotate-90" />}
          iconPosition={ButtonIconPosition.Right}
          onClick={onOpen}
          className="-ml-2 group-hover:text-brand-default"
        >
          {briefCopy.topicExpand}
        </Button>
      </div>
    </article>
  );
};

export const CoverTopics = ({
  topics,
  readSet,
  onOpen,
}: CoverTopicsProps): ReactElement => (
  <section>
    <div className="mb-3 flex items-end justify-between gap-3 px-1">
      <div className="flex items-center gap-2">
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
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        className="hidden tablet:inline"
      >
        {briefCopy.topicsHint}
      </Typography>
    </div>
    <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
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
