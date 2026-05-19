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
  TrendingIcon,
  UpvoteIcon,
  DiscussIcon,
  ArrowIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import type { StoryItem } from './types';

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

const truncate = (s: string, n: number): string =>
  s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;

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
  const topComment = story.highlightedComments[0];
  const quote = topComment
    ? truncate(stripMd(topComment.content).trim(), 140)
    : null;
  const sourcesShown = story.sources.slice(0, 3);
  const extraSources = story.sources.length - sourcesShown.length;
  const summary = stripMd(story.summary).trim();
  const heroImage = story.posts.find((p) => p.image)?.image;
  const panelId = `brief-tldr-${story.id}`;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className={classNames(
          'group flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-float',
          isRead && !isExpanded && 'opacity-60',
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Typography
            tag={TypographyTag.H3}
            type={TypographyType.Body}
            bold
            color={isRead ? TypographyColor.Tertiary : TypographyColor.Primary}
            className={classNames(
              '!leading-snug transition-colors',
              isRead &&
                !isExpanded &&
                'decoration-text-quaternary/40 line-through',
              !isRead && 'group-hover:text-brand-default',
            )}
          >
            {story.title}
          </Typography>

          {quote && !isExpanded ? (
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
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {heroImage ? (
            <div className="size-16 shrink-0 overflow-hidden rounded-10 bg-surface-float">
              <img
                src={heroImage}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="size-16 shrink-0 rounded-10 bg-gradient-to-br from-accent-cabbage-bolder to-accent-water-bolder" />
          )}
          <ArrowIcon
            size={IconSize.XSmall}
            className={classNames(
              'text-text-quaternary transition-transform',
              isExpanded ? 'rotate-180' : '',
            )}
          />
        </div>
      </button>

      {isExpanded ? (
        <div
          id={panelId}
          className="border-t border-border-subtlest-quaternary bg-background-subtle px-5 py-4"
        >
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            bold
            className="mb-2 uppercase tracking-[0.14em]"
          >
            TL;DR
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="!leading-relaxed"
          >
            {summary}
          </Typography>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex items-center gap-1.5 rounded-10 bg-text-primary px-3 py-1.5 text-surface-invert transition-colors hover:bg-brand-default"
            >
              <Typography type={TypographyType.Caption1} bold>
                Read the full breakdown
              </Typography>
              <ArrowIcon size={IconSize.XXSmall} className="rotate-90" />
            </button>
            {topComment ? (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
              >
                {story.highlightedComments.length} community insights ·{' '}
                {story.posts.length} posts analyzed
              </Typography>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
};

export const CoverGrid = ({
  stories,
  readSet,
  onOpen,
  onMarkRead,
}: CoverGridProps): ReactElement => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const conversations = stories.reduce(
    (sum, s) => sum + s.posts.length + s.highlightedComments.length,
    0,
  );

  return (
    <section>
      <div className="mb-3 flex flex-col gap-0.5 px-1">
        <div className="flex items-baseline gap-2">
          <TrendingIcon
            size={IconSize.Small}
            className="self-center text-accent-cabbage-default"
            secondary
          />
          <Typography type={TypographyType.Title3} bold>
            What devs are debating
          </Typography>
        </div>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="pl-7"
        >
          Ranked from {conversations.toLocaleString()} community conversations.
        </Typography>
      </div>
      <ol className="divide-y divide-border-subtlest-quaternary overflow-hidden rounded-12 border border-border-subtlest-quaternary bg-background-default">
        {stories.map((s) => (
          <StoryRow
            key={s.id}
            story={s}
            isRead={readSet.has(s.id)}
            isExpanded={expanded === s.id}
            onToggle={() => {
              const isOpen = expanded === s.id;
              setExpanded(isOpen ? null : s.id);
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
