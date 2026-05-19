import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import {
  TrendingIcon,
  TimerIcon,
  UpvoteIcon,
  DiscussIcon,
  ArrowIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import type { StoryItem } from './types';
import { briefCopy } from './copy';

interface CoverGridProps {
  stories: StoryItem[];
  readSet: Set<string>;
  onOpen: (story: StoryItem) => void;
}

const stripMd = (s: string): string =>
  s
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,2}([^*_\n]+)[*_]{1,2}/g, '$1');

const estimateMinutes = (story: StoryItem): number =>
  Math.max(
    2,
    Math.round(story.summary.split(/\s+/).filter(Boolean).length / 220),
  );

const formatRank = (n: number): string => String(n + 1).padStart(2, '0');

const StoryRow = ({
  story,
  rank,
  isRead,
  onOpen,
  isLast,
}: {
  story: StoryItem;
  rank: number;
  isRead: boolean;
  onOpen: () => void;
  isLast: boolean;
}): ReactElement => {
  const minutes = estimateMinutes(story);
  const primarySource = story.sources[0];
  const extraSources = story.sources.length - 1;
  const quote = story.highlightedComments[0];
  const cleanQuote = quote ? stripMd(quote.content).trim() : null;
  const shortQuote =
    cleanQuote && cleanQuote.length > 140
      ? `${cleanQuote.slice(0, 137)}…`
      : cleanQuote;

  return (
    <li
      className={classNames(
        'border-border-subtlest-tertiary',
        !isLast && 'border-b',
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className={classNames(
          'group flex w-full items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-float laptop:px-6',
          isRead && 'opacity-60',
        )}
      >
        <span
          aria-hidden
          className="mt-0.5 hidden w-9 shrink-0 tabular-nums tablet:block"
        >
          <Typography
            type={TypographyType.Title3}
            color={
              isRead ? TypographyColor.Quaternary : TypographyColor.Tertiary
            }
            bold
            className="!leading-none"
          >
            {formatRank(rank)}
          </Typography>
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-text-quaternary">
            {primarySource ? (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <span className="size-4 shrink-0 overflow-hidden rounded-6 bg-surface-float">
                  <img
                    src={primarySource.sourceImage}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </span>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  bold
                  className="truncate"
                >
                  {primarySource.sourceName}
                </Typography>
                {extraSources > 0 ? (
                  <Typography
                    type={TypographyType.Caption2}
                    color={TypographyColor.Quaternary}
                  >
                    +{extraSources} sources
                  </Typography>
                ) : null}
              </span>
            ) : null}
            <span className="text-border-subtlest-secondary">·</span>
            <span className="inline-flex items-center gap-1">
              <TimerIcon size={IconSize.XXSmall} />
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
                bold
              >
                {briefCopy.storyReadTime(minutes)}
              </Typography>
            </span>
            <span className="ml-auto inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <UpvoteIcon
                  size={IconSize.XXSmall}
                  className="text-accent-avocado-default"
                />
                <Typography
                  type={TypographyType.Caption2}
                  color={TypographyColor.Quaternary}
                  bold
                >
                  {story.totalUpvotes}
                </Typography>
              </span>
              <span className="inline-flex items-center gap-1">
                <DiscussIcon size={IconSize.XXSmall} />
                <Typography
                  type={TypographyType.Caption2}
                  color={TypographyColor.Quaternary}
                  bold
                >
                  {story.totalComments}
                </Typography>
              </span>
            </span>
          </div>
          <Typography
            type={TypographyType.Title3}
            bold
            color={isRead ? TypographyColor.Tertiary : TypographyColor.Primary}
            className={classNames(
              '!leading-snug tracking-[-0.015em] transition-colors',
              isRead && 'decoration-text-quaternary/40 line-through',
              !isRead && 'group-hover:text-brand-default',
            )}
          >
            {story.title}
          </Typography>
          {shortQuote ? (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              className="mt-1 line-clamp-2 italic"
            >
              “{shortQuote}”
            </Typography>
          ) : null}
        </div>
        <ArrowIcon
          size={IconSize.XSmall}
          className="mt-1.5 hidden shrink-0 rotate-90 text-text-quaternary opacity-0 transition-opacity group-hover:opacity-100 tablet:block"
        />
      </button>
    </li>
  );
};

export const CoverGrid = ({
  stories,
  readSet,
  onOpen,
}: CoverGridProps): ReactElement => (
  <section>
    <div className="mb-3 flex items-end justify-between gap-3 px-1">
      <div className="flex items-center gap-2">
        <TrendingIcon
          size={IconSize.XSmall}
          className="text-accent-cabbage-default"
          secondary
        />
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Primary}
          bold
          className="uppercase tracking-[0.16em]"
        >
          {briefCopy.attentionEyebrow}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="tabular-nums"
        >
          · {stories.length}
        </Typography>
      </div>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        className="hidden tablet:inline"
      >
        {briefCopy.attentionHint}
      </Typography>
    </div>
    <ol className="overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle">
      {stories.map((s, idx) => (
        <StoryRow
          key={s.id}
          story={s}
          rank={idx}
          isRead={readSet.has(s.id)}
          onOpen={() => onOpen(s)}
          isLast={idx === stories.length - 1}
        />
      ))}
    </ol>
  </section>
);
