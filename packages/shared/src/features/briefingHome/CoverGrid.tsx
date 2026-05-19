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

const SectionHeading = ({ count }: { count: number }): ReactElement => (
  <div className="mb-4 flex items-end justify-between gap-3">
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
        · {count}
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
);

const CoverGridCard = ({
  story,
  isRead,
  onOpen,
}: {
  story: StoryItem;
  isRead: boolean;
  onOpen: () => void;
}): ReactElement => {
  const minutes = estimateMinutes(story);
  const primarySource = story.sources[0];
  const extraSources = story.sources.length - 1;
  const quote = story.highlightedComments[0];
  const cleanQuote = quote ? stripMd(quote.content).trim() : null;
  const shortQuote =
    cleanQuote && cleanQuote.length > 90
      ? `${cleanQuote.slice(0, 87)}…`
      : cleanQuote;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={classNames(
        'group flex h-full flex-col gap-2.5 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4 text-left transition-colors hover:border-border-subtlest-secondary hover:bg-surface-float',
        isRead && 'opacity-60',
      )}
    >
      <div className="flex items-center gap-2 text-text-quaternary">
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
                +{extraSources}
              </Typography>
            ) : null}
          </span>
        ) : null}
        <span className="ml-auto inline-flex items-center gap-1 text-text-quaternary">
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
          'line-clamp-3 !leading-snug transition-colors',
          isRead && 'decoration-text-quaternary/40 line-through',
          !isRead && 'group-hover:text-brand-default',
        )}
      >
        {story.title}
      </Typography>

      {shortQuote ? (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="line-clamp-2 italic"
        >
          “{shortQuote}”
        </Typography>
      ) : null}

      <div className="mt-auto flex items-center gap-3 pt-2 text-text-quaternary">
        <span className="inline-flex items-center gap-1">
          <UpvoteIcon size={IconSize.XXSmall} />
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            {story.totalUpvotes}
          </Typography>
        </span>
        <span className="inline-flex items-center gap-1">
          <DiscussIcon size={IconSize.XXSmall} />
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            {story.totalComments}
          </Typography>
        </span>
      </div>
    </button>
  );
};

export const CoverGrid = ({
  stories,
  readSet,
  onOpen,
}: CoverGridProps): ReactElement => (
  <section>
    <SectionHeading count={stories.length} />
    <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
      {stories.map((s) => (
        <CoverGridCard
          key={s.id}
          story={s}
          isRead={readSet.has(s.id)}
          onOpen={() => onOpen(s)}
        />
      ))}
    </div>
  </section>
);
