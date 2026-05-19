import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { TrendingIcon, UpvoteIcon, DiscussIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import type { StoryItem } from './types';

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

const formatRank = (n: number): string => String(n + 1).padStart(2, '0');

const truncate = (s: string, n: number): string =>
  s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;

const StoryRow = ({
  story,
  rank,
  isRead,
  onOpen,
}: {
  story: StoryItem;
  rank: number;
  isRead: boolean;
  onOpen: () => void;
}): ReactElement => {
  const topComment = story.highlightedComments[0];
  const quote = topComment
    ? truncate(stripMd(topComment.content).trim(), 160)
    : null;
  const sourcesShown = story.sources.slice(0, 3);
  const extraSources = story.sources.length - sourcesShown.length;

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={classNames(
          'group flex w-full flex-col items-stretch gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-float tablet:flex-row tablet:items-start tablet:gap-5 tablet:px-5',
          isRead && 'opacity-60',
        )}
      >
        <Typography
          type={TypographyType.LargeTitle}
          bold
          className={classNames(
            'shrink-0 tabular-nums !leading-none',
            isRead ? 'text-text-quaternary' : 'text-accent-ketchup-default',
          )}
        >
          {formatRank(rank)}
        </Typography>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Typography
            tag={TypographyTag.H3}
            type={TypographyType.Title3}
            bold
            color={isRead ? TypographyColor.Tertiary : TypographyColor.Primary}
            className={classNames(
              '!leading-snug tracking-[-0.01em] transition-colors',
              isRead && 'decoration-text-quaternary/40 line-through',
              !isRead && 'group-hover:text-brand-default',
            )}
          >
            {story.title}
          </Typography>

          {quote ? (
            <figure className="border-l-2 border-accent-ketchup-default pl-3">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
                className="!leading-snug"
              >
                <span aria-hidden className="mr-1 text-accent-ketchup-default">
                  “
                </span>
                {quote}
                <span aria-hidden className="ml-1 text-accent-ketchup-default">
                  ”
                </span>
                {topComment ? (
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    className="ml-2 italic"
                  >
                    — @{topComment.username}
                  </Typography>
                ) : null}
              </Typography>
            </figure>
          ) : null}

          <div className="mt-1 flex flex-wrap items-center gap-3 text-text-quaternary">
            <span className="inline-flex shrink-0 items-center -space-x-1.5">
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
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="min-w-0 truncate"
            >
              {sourcesShown.map((s) => s.sourceName).join(', ')}
              {extraSources > 0 ? ` +${extraSources}` : ''}
            </Typography>
            <span className="ml-auto inline-flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1">
                <UpvoteIcon
                  size={IconSize.XXSmall}
                  className="text-accent-avocado-default"
                />
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                  bold
                  className="tabular-nums"
                >
                  {story.totalUpvotes}
                </Typography>
              </span>
              <span className="inline-flex items-center gap-1">
                <DiscussIcon size={IconSize.XXSmall} />
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                  bold
                  className="tabular-nums"
                >
                  {story.totalComments}
                </Typography>
              </span>
            </span>
          </div>
        </div>
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
    <div className="mb-3 flex items-baseline justify-between gap-2 px-1">
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
          className="uppercase tracking-[0.18em]"
        >
          What devs are debating
        </Typography>
      </div>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Quaternary}
        bold
        className="uppercase tracking-[0.16em]"
      >
        {stories.length} threads
      </Typography>
    </div>
    <ol className="divide-y divide-border-subtlest-tertiary overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default">
      {stories.map((s, idx) => (
        <StoryRow
          key={s.id}
          story={s}
          rank={idx}
          isRead={readSet.has(s.id)}
          onOpen={() => onOpen(s)}
        />
      ))}
    </ol>
  </section>
);
