import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  StarIcon,
  UpvoteIcon,
  DiscussIcon,
  ArrowIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { BriefFeedback } from './BriefFeedback';
import type { StoryItem } from './types';

const InlineStat = ({
  icon,
  value,
  ariaLabel,
}: {
  icon: ReactElement;
  value: number;
  ariaLabel: string;
}): ReactElement => (
  <span
    aria-label={ariaLabel}
    className="inline-flex items-center gap-1.5 px-1"
  >
    {icon}
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      bold
      className="tabular-nums"
    >
      {value}
    </Typography>
  </span>
);

interface CoverGridProps {
  stories: StoryItem[];
  readSet: Set<string>;
  onOpen: (story: StoryItem) => void;
  onMarkRead: (id: string) => void;
}

const stripMd = (s: string): string =>
  s
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,2}([^*_\n]+)[*_]{1,2}/g, '$1');

const StoryRow = ({
  story,
  isRead,
  isExpanded,
  onToggle,
  onOpen,
}: {
  story: StoryItem;
  isRead: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
}): ReactElement => {
  const sourcesShown = story.sources.slice(0, 3);
  const summary = stripMd(story.summary).trim();
  const panelId = `brief-tldr-${story.id}`;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className={classNames(
          'group flex w-full flex-col gap-2 px-4 py-2.5 text-left transition-colors',
          !isExpanded && 'hover:bg-surface-float',
          isRead && !isExpanded && 'opacity-60',
        )}
      >
        <div className="flex w-full items-start gap-4">
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
              'min-w-0 flex-1 !leading-snug line-through',
              isRead && !isExpanded
                ? 'decoration-text-quaternary/40'
                : 'decoration-transparent',
            )}
          >
            {story.title}
          </Typography>

          <div className="flex shrink-0 items-center gap-2">
            <InlineStat
              ariaLabel={`${story.totalUpvotes} upvotes`}
              icon={
                <UpvoteIcon
                  size={IconSize.XSmall}
                  className="text-text-tertiary"
                />
              }
              value={story.totalUpvotes}
            />
            <InlineStat
              ariaLabel={`${story.totalComments} comments`}
              icon={
                <DiscussIcon
                  size={IconSize.XSmall}
                  className="text-text-tertiary"
                />
              }
              value={story.totalComments}
            />
            <span className="hidden items-center -space-x-1.5 pl-1 tablet:inline-flex">
              {sourcesShown.map((src) => (
                <span
                  key={src.sourceId}
                  className="overflow-hidden rounded-full border-2 border-background-default bg-surface-float"
                >
                  <img
                    src={src.sourceImage}
                    alt=""
                    loading="lazy"
                    className="size-4 object-cover"
                  />
                </span>
              ))}
            </span>
            <ArrowIcon
              size={IconSize.XSmall}
              className={classNames(
                'shrink-0 text-text-tertiary transition-transform duration-300 ease-out',
                isExpanded ? 'rotate-0' : 'rotate-180',
              )}
              aria-hidden
            />
          </div>
        </div>

        {isExpanded ? (
          <div id={panelId} className="flex flex-col gap-3">
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              className="!leading-relaxed"
            >
              {summary}
            </Typography>
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
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
              <BriefFeedback prompt="Worth your time?" />
            </div>
          </div>
        ) : null}
      </button>
    </li>
  );
};

export const CoverGrid = ({
  stories,
  readSet,
  onOpen,
  onMarkRead,
}: CoverGridProps): ReactElement => {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2 px-1">
        <StarIcon
          size={IconSize.Small}
          className="self-center text-accent-cabbage-default"
          secondary
        />
        <Typography type={TypographyType.Title3} bold>
          Picks
        </Typography>
      </div>
      <ol className="divide-y divide-border-subtlest-quaternary overflow-hidden rounded-12 border border-border-subtlest-quaternary bg-background-default">
        {stories.map((s) => (
          <StoryRow
            key={s.id}
            story={s}
            isRead={readSet.has(s.id)}
            isExpanded={expanded.has(s.id)}
            onToggle={() => {
              const isOpen = expanded.has(s.id);
              setExpanded((current) => {
                const next = new Set(current);
                if (isOpen) {
                  next.delete(s.id);
                } else {
                  next.add(s.id);
                }
                return next;
              });
              if (!isOpen) {
                onMarkRead(s.id);
              }
            }}
            onOpen={() => onOpen(s)}
          />
        ))}
      </ol>
    </section>
  );
};
