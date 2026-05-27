import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { ArrowIcon, MegaphoneIcon, SettingsIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { HeadlinesSettingsModal } from './HeadlinesSettingsModal';
import { BriefFeedback } from './BriefFeedback';
import { TOPIC_TOKEN, type TopicDigest } from './types';

interface CoverTopicsProps {
  topics: TopicDigest[];
  readSet: Set<string>;
  onOpen: (topic: TopicDigest) => void;
  onMarkRead: (id: string) => void;
}

const TopicRow = ({
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
  const panelId = `brief-topic-tldr-${topic.id}`;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className={classNames(
          'group flex w-full flex-col gap-3 px-4 py-4 text-left transition-colors tablet:px-5',
          !isExpanded && 'hover:bg-surface-float',
          isRead && !isExpanded && 'opacity-60',
        )}
      >
        <div className="flex w-full items-center gap-4">
          <div className="flex min-w-0 max-w-3xl flex-1 flex-col gap-1">
            <Typography
              type={TypographyType.Caption1}
              bold
              className={classNames(TOPIC_TOKEN[topic.topic])}
            >
              {topic.topic}
            </Typography>
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Body}
              bold
              color={
                isRead && !isExpanded
                  ? TypographyColor.Tertiary
                  : TypographyColor.Primary
              }
              className={classNames(
                '!leading-snug line-through',
                isRead && !isExpanded
                  ? 'decoration-text-quaternary/40'
                  : 'decoration-transparent',
              )}
            >
              {topic.title}
            </Typography>
          </div>
          <ArrowIcon
            size={IconSize.XSmall}
            className={classNames(
              'ml-auto shrink-0 text-text-quaternary transition-transform duration-300 ease-out',
              isExpanded ? 'rotate-0' : 'rotate-180',
            )}
            aria-hidden
          />
        </div>

        {isExpanded ? (
          <div id={panelId} className="contents">
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              className="max-w-3xl !leading-relaxed"
            >
              {topic.tldr}
            </Typography>
            <div className="mt-1 flex w-full flex-wrap items-center justify-between gap-3">
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
              <BriefFeedback prompt="Worth your time?" className="ml-auto" />
            </div>
          </div>
        ) : null}
      </button>
    </li>
  );
};

export const CoverTopics = ({
  topics,
  readSet,
  onOpen,
  onMarkRead,
}: CoverTopicsProps): ReactElement => {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2 px-1">
        <MegaphoneIcon
          size={IconSize.Small}
          className="text-accent-water-default"
          secondary
        />
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Headlines
        </Typography>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<SettingsIcon />}
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Manage Headlines subscriptions"
          className="ml-auto"
        />
      </div>
      <ol className="-mx-4 divide-y divide-border-subtlest-quaternary overflow-hidden bg-background-default tablet:mx-0 tablet:rounded-12 tablet:border tablet:border-border-subtlest-quaternary">
        {topics.map((t) => (
          <TopicRow
            key={t.id}
            topic={t}
            isRead={readSet.has(t.id)}
            isExpanded={expanded.has(t.id)}
            onToggle={() => {
              const isOpen = expanded.has(t.id);
              setExpanded((current) => {
                const next = new Set(current);
                if (isOpen) {
                  next.delete(t.id);
                } else {
                  next.add(t.id);
                }
                return next;
              });
              if (!isOpen) {
                onMarkRead(t.id);
              }
            }}
            onOpen={() => onOpen(t)}
          />
        ))}
      </ol>
      {isSettingsOpen ? (
        <HeadlinesSettingsModal
          isOpen
          onRequestClose={() => setIsSettingsOpen(false)}
        />
      ) : null}
    </section>
  );
};
