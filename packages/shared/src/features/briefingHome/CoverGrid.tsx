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

const truncate = (s: string, n: number): string =>
  s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;

const StoryRow = ({
  story,
  isRead,
  onOpen,
}: {
  story: StoryItem;
  isRead: boolean;
  onOpen: () => void;
}): ReactElement => {
  const topComment = story.highlightedComments[0];
  const quote = topComment
    ? truncate(stripMd(topComment.content).trim(), 140)
    : null;
  const sourcesShown = story.sources.slice(0, 3);
  const extraSources = story.sources.length - sourcesShown.length;

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={classNames(
          'group flex w-full flex-col gap-2 px-5 py-4 text-left transition-colors hover:bg-surface-float',
          isRead && 'opacity-60',
        )}
      >
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Body}
          bold
          color={isRead ? TypographyColor.Tertiary : TypographyColor.Primary}
          className={classNames(
            '!leading-snug transition-colors',
            isRead && 'decoration-text-quaternary/40 line-through',
            !isRead && 'group-hover:text-brand-default',
          )}
        >
          {story.title}
        </Typography>

        {quote ? (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="line-clamp-2 !leading-snug"
          >
            <span aria-hidden className="mr-1 text-text-quaternary">
              “
            </span>
            {quote}
            {topComment ? (
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
                className="ml-1"
              >
                — @{topComment.username}
              </Typography>
            ) : null}
          </Typography>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 text-text-quaternary">
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <UpvoteIcon
                size={IconSize.XXSmall}
                className="text-accent-avocado-default"
              />
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
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
                className="tabular-nums"
              >
                {story.totalComments}
              </Typography>
            </span>
          </span>
          <span
            aria-hidden
            className="h-3 w-px shrink-0 bg-border-subtlest-quaternary"
          />
          <span className="inline-flex min-w-0 shrink items-center gap-2">
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
          </span>
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
    <div className="mb-3 flex items-baseline gap-2 px-1">
      <TrendingIcon
        size={IconSize.Small}
        className="self-center text-accent-cabbage-default"
        secondary
      />
      <Typography type={TypographyType.Title3} bold>
        What devs are debating
      </Typography>
    </div>
    <ol className="divide-y divide-border-subtlest-quaternary overflow-hidden rounded-12 border border-border-subtlest-quaternary bg-background-default">
      {stories.map((s) => (
        <StoryRow
          key={s.id}
          story={s}
          isRead={readSet.has(s.id)}
          onOpen={() => onOpen(s)}
        />
      ))}
    </ol>
  </section>
);
