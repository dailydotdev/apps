import type { ReactElement } from 'react';
import React, { useState } from 'react';
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
import {
  TOPIC_BG_TOKEN,
  TOPIC_BORDER_TOKEN,
  TOPIC_TOKEN,
  type TopicDigest,
} from './types';
import { briefCopy } from './copy';

interface CoverTopicsProps {
  topics: TopicDigest[];
  readSet: Set<string>;
  onOpen: (topic: TopicDigest) => void;
}

const estimateTopicMinutes = (topic: TopicDigest): number => {
  const text = topic.content.replace(/<[^>]+>/g, ' ');
  const words =
    topic.tldr.split(/\s+/).filter(Boolean).length +
    text.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
};

export const CoverTopics = ({
  topics,
  readSet,
  onOpen,
}: CoverTopicsProps): ReactElement => {
  const [activeId, setActiveId] = useState<string>(topics[0]?.id ?? '');
  const active = topics.find((t) => t.id === activeId) ?? topics[0];

  if (!active) {
    return null as unknown as ReactElement;
  }

  const activeMinutes = estimateTopicMinutes(active);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
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

      <div
        role="tablist"
        aria-label={briefCopy.topicPagerLabel}
        className="no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1"
      >
        {topics.map((t) => {
          const isActive = t.id === active.id;
          const isRead = readSet.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(t.id)}
              className={classNames(
                'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 transition-colors',
                isActive
                  ? `${TOPIC_BORDER_TOKEN[t.topic]} bg-background-default`
                  : 'border-border-subtlest-tertiary bg-background-subtle hover:bg-surface-float',
                isRead && !isActive && 'opacity-60',
              )}
            >
              <span
                className={classNames(
                  'inline-block size-2 rounded-full',
                  TOPIC_BG_TOKEN[t.topic].replace('bg-', 'bg-'),
                )}
              />
              <Typography
                type={TypographyType.Footnote}
                bold
                color={
                  isActive ? TypographyColor.Primary : TypographyColor.Secondary
                }
              >
                {t.topic}
              </Typography>
            </button>
          );
        })}
      </div>

      <article
        className="overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle"
        key={active.id}
      >
        <div
          className={classNames(
            'flex items-center justify-between gap-3 border-b border-border-subtlest-tertiary px-5 py-2.5',
            TOPIC_BG_TOKEN[active.topic],
            'bg-opacity-30',
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={classNames(
                'inline-block size-2 rounded-full',
                TOPIC_BG_TOKEN[active.topic],
              )}
            />
            <Typography
              type={TypographyType.Caption2}
              bold
              className={classNames(
                'uppercase tracking-[0.14em]',
                TOPIC_TOKEN[active.topic],
              )}
            >
              {active.topic} · {briefCopy.topicWeekly}
            </Typography>
          </div>
          <span className="inline-flex items-center gap-1 text-text-tertiary">
            <TimerIcon size={IconSize.XXSmall} />
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              bold
            >
              {briefCopy.storyReadTime(activeMinutes)}
            </Typography>
          </span>
        </div>
        <div className="flex flex-col gap-3 p-5">
          <Typography
            type={TypographyType.Title3}
            bold
            color={TypographyColor.Primary}
            className="!leading-snug tracking-[-0.015em]"
          >
            {active.title}
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
            className="!leading-relaxed"
          >
            {active.tldr}
          </Typography>
          <div>
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<ArrowIcon className="rotate-90" />}
              iconPosition={ButtonIconPosition.Right}
              onClick={() => onOpen(active)}
            >
              {briefCopy.topicExpand}
            </Button>
          </div>
        </div>
      </article>
    </section>
  );
};
