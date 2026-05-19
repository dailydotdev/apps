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
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ArrowIcon } from '../../components/icons';
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

  return (
    <section className="mt-8">
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        bold
        className="mb-3 uppercase tracking-[0.18em]"
      >
        {briefCopy.topicsEyebrow}
      </Typography>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {topics.map((t) => {
          const isActive = t.id === active.id;
          const isRead = readSet.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className={classNames(
                'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 transition-colors',
                isActive
                  ? `${TOPIC_BORDER_TOKEN[t.topic]} ${TOPIC_BG_TOKEN[t.topic]}`
                  : 'border-border-subtlest-tertiary bg-background-subtle hover:bg-surface-float',
                isRead && !isActive && 'opacity-60',
              )}
            >
              <span
                className={classNames(
                  'inline-block size-1.5 rounded-full',
                  TOPIC_BG_TOKEN[t.topic],
                  'ring-1 ring-inset',
                  isActive
                    ? TOPIC_BORDER_TOKEN[t.topic].replace('border-', 'ring-')
                    : 'ring-border-subtlest-tertiary',
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
        className={classNames(
          'mt-3 flex flex-col gap-3 rounded-12 border-l-4 bg-background-subtle p-4 transition-colors',
          TOPIC_BORDER_TOKEN[active.topic],
        )}
        key={active.id}
      >
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
        <Typography
          type={TypographyType.Title3}
          bold
          color={TypographyColor.Primary}
          className="!leading-snug"
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
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="rotate-90" />}
            onClick={() => onOpen(active)}
          >
            {briefCopy.topicExpand}
          </Button>
        </div>
      </article>
    </section>
  );
};
